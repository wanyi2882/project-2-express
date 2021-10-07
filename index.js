const express = require('express');
const cors = require('cors');
require ('dotenv').config();

const MongoUtil = require('./MongoUtil.js');
const ObjectId = require('mongodb').ObjectId;

let app = express();

// Express process JSON payload in POST, PUT and PATCH requests
app.use(express.json());

// Enable CORS
app.use(cors());

async function main(){
    await MongoUtil.connect(process.env.MONGO_URI, "flower_stop_database")

    app.get('/', async (req, res) => {

        try {
            let db = MongoUtil.getDB();

            // start with an empty critera object
            let criteria = {};

            // we fill in the critera depending on whether specific
            // query string keys are provided

            // if the `description` key exists in req.query

            if (req.query.food) {
                criteria['food'] = {
                    '$in': [req.query.food]
                }
            }

            // console.log(criteria)

            let sightings = await db.collection('listings').find(criteria).toArray();
            res.status(200);
            res.send(sightings);
        } catch (e) {
            res.status(500);
            res.send({
                'error':"We have encountered an internal server error"
            })         
        }
    })    
}

main();

// START SERVER
app.listen(3000, () => {
    console.log("Server started")
})