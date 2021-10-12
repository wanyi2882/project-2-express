const express = require('express');
const cors = require('cors');
require('dotenv').config();

const MongoUtil = require('./MongoUtil.js');
const ObjectId = require('mongodb').ObjectId;

let app = express();

// Express process JSON payload in POST, PUT and PATCH requests
app.use(express.json());

// Enable CORS
app.use(cors());

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "flower_stop_database")

    // Read listing collection
    app.get('/listings', async (req, res) => {

        try {
            let db = MongoUtil.getDB();

            // start with an empty critera object
            let criteria = {};

            // find by name
            if (req.query.name) {
                criteria['name'] = {
                    '$regex': req.query.name,
                    '$options': 'i'
                }
            }

            // find by flower type
            if (req.query.flower_type) {
                criteria['flower_type'] = {
                    '$all': req.query.flower_type
                }
            }

            // find by occasion
            if (req.query.occasion) {
                criteria['occasion'] = {
                    '$all': req.query.occasion
                }
            }

            console.log(criteria)

            let listings = await db.collection('listings')
                .find(criteria)
                .toArray();
            res.status(200);
            res.send(listings);
        } catch (e) {
            res.status(500);
            res.send({
                'error': "We have encountered an internal server error"
            })
        }
    })

    // Create and send to listing collection
    app.post('/listings', async (req, res) => {

        try {
            // req.body is an object that contains the
            // data sent to the express endpoint
            let name = req.body.name;
            let date_listed = req.body.datetime ? new Date(req.body.datetime) : new Date();
            let flower_type = [req.body.flower_type];
            let price = req.body.price;
            let occasion = [req.body.occasion]
            let quantity = req.body.quantity
            let image = req.body.image

            let db = MongoUtil.getDB();
            let result = await db.collection('listings').insertOne({
                name, date_listed, flower_type, price, occasion, quantity, image
            })

            // inform the client that the process is successful
            res.status(200);
            res.json(result);
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.log(e);
        }
    })

    // Update listing (Update the whole document)
    app.put('/listings/:id', async (req, res) => {
        try {
            let name = req.body.name;
            let date_listed = req.body.datetime ? new Date(req.body.datetime) : new Date();
            let flower_type = [req.body.flower_type];
            let price = req.body.price;
            let occasion = [req.body.occasion]
            let quantity = req.body.quantity
            let image = req.body.image

            let db = MongoUtil.getDB()
            let results = await db.collection('listings').updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$set': {
                    name, date_listed, flower_type, price, occasion, quantity, image
                }
            })
            res.status(200)
            res.send(results)
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.log(e);
        }
    })

    // Delete listing
    app.delete('/listings/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let results = await db.collection('listings').remove({
                '_id': ObjectId(req.params.id)
            })
            res.status(200);
            res.send(results);
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.log(e);
        }
    })

    // Read Florists collection
    app.get('/florists', async (req, res) => {

        try {
            let db = MongoUtil.getDB();

            // start with an empty critera object
            let criteria = {};
   
            let florists = await db.collection('florists')
                .find(criteria)
                .toArray();
            res.status(200);
            res.send(florists);
        } catch (e) {
            res.status(500);
            res.send({
                'error': "We have encountered an internal server error"
            })
        }
    })

    // Update florist document
    app.post('/florists', async (req, res) =>{
        try {
            let name = req.body.name
            let number = req.body.number
            let email = req.body.email
            let instagram = req.body.instagram
            let facebook = req.body.facebook
            let social_media = {facebook, instagram}
            let contact = {number, email, social_media}

            console.log(contact)


            let db = MongoUtil.getDB();
            let result = await db.collection('florists').insertOne({
                name, contact
            })

            // inform the client that the process is successful
            res.status(200);
            res.json(result);
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.log(e);
        }
    })

}

main();

// START SERVER
app.listen(3000, () => {
    console.log("Server started")
})