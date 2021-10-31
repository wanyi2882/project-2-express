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

            // find by description
            if (req.query.description) {
                criteria['description'] = {
                    '$regex': req.query.description,
                    '$options': 'i'
                }
            }
            // find by flower type
            if (req.query.flower_type) {
                let array = req.query.flower_type.split(",")
                criteria['flower_type'] = {
                    '$in': array
                }
            }

            // find by occasion
            if (req.query.occasion) {
                let array = req.query.occasion.split(",")
                criteria['occasion'] = {
                    '$in': array
                }
            }

            // filter by price
            if (req.query.price_greater) {
                criteria['price'] = {
                    '$gt': parseFloat(req.query.price_greater)
                }
            }

            if (req.query.price_lesser) {
                criteria['price'] = {
                    '$lt': parseFloat(req.query.price_lesser)
                }
            }

            if (req.query.price_greater && req.query.price_lesser) {
                criteria['price'] = {
                    '$gt': parseFloat(req.query.price_greater),
                    '$lt': parseFloat(req.query.price_lesser)
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
            let date_listed = new Date();
            let description = req.body.description
            let flower_type = req.body.flower_type;
            let price = req.body.price;
            let occasion = req.body.occasion
            let quantity = req.body.quantity
            let image = req.body.image
            let florist_id = ObjectId(req.body.florist_id)
            let florist_name = req.body.florist_name
            let number = req.body.number
            let instagram = req.body.instagram
            let facebook = req.body.facebook
            let contact = { number, instagram, facebook }
            let contact_method = req.body.contact_method
            let florist = { florist_id, florist_name, contact, contact_method }

            let error = ""

            if (name.length < 1) {
                error = error + "Name is too short. "
            }

            if (name.description < 1) {
                error = error + "Please provide description of listing. "
            }

            if (flower_type.length < 1) {
                error = error + "Please choose at least one flower type. "
            }

            if (parseFloat(price) <= 0 || !parseFloat(price)) {
                error = error + "Please enter price. "
            }

            if (parseInt(quantity) <= 0 || !parseInt(quantity)) {
                error = error + "Please enter quantity more than 0. "
            }

            if (occasion.length < 1) {
                error = error + "Please choose at least one occasion. "
            }

            if (!image.endsWith(".jpg") && !image.endsWith(".png") && !image.endsWith(".jpeg")) {
                error = error + "Please provide a jpeg/jpg/jpg image. "
            }

            if (florist_name.length < 1) {
                error = error + "Please provide name of florist. "
            }

            if (contact_method.length < 1) {
                error = error + "Please choose at least one way to be contacted by buyers. "
            }

            if (contact_method.includes("whatsapp")) {
                if (number.length < 8) {
                    error = error + "Please provide a valid 8 digit contact number. "
                }
            }

            if (contact_method.includes("instagram")) {
                if (!instagram.includes("instagram.com")) {
                    error = error + "Please enter a valid Instagram URL. "
                }
            }

            if (contact_method.includes("facebook")) {
                if (!facebook.includes("facebook.com")) {
                    error = error + "Please enter a valid Facebook URL. "
                }
            }

            if (error == "") {
                let db = MongoUtil.getDB();
                let result = await db.collection('listings').insertOne({
                    name, date_listed, description, flower_type, price, occasion, quantity, image,
                    florist
                })

                res.status(200);
                res.json(result);
            }

            else {
                res.status(400)
                res.json(error)
                console.log(error)
            }
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
            let description = req.body.description;
            let flower_type = req.body.flower_type;
            let price = req.body.price;
            let occasion = req.body.occasion
            let quantity = req.body.quantity
            let image = req.body.image
            let florist_id = ObjectId(req.body.florist_id)
            let florist_name = req.body.florist_name
            let number = req.body.number
            let instagram = req.body.instagram
            let facebook = req.body.facebook
            let contact = { number, instagram, facebook }
            let contact_method = req.body.contact_method
            let florist = { florist_id, florist_name, contact, contact_method }

            let error = ""

            if (name.length < 1) {
                error = error + "Name is too short. "
            }

            if (name.description < 1) {
                error = error + "Please provide description of listing. "
            }

            if (flower_type.length < 1) {
                error = error + "Please choose at least one flower type. "
            }

            if (parseFloat(price) <= 0 || !parseFloat(price)) {
                error = error + "Please enter price. "
            }

            if (parseInt(quantity) <= 0 || !parseInt(quantity)) {
                error = error + "Please enter quantity more than 0. "
            }

            if (occasion.length < 1) {
                error = error + "Please choose at least one occasion. "
            }

            if (!image.endsWith(".jpg") && !image.endsWith(".png") && !image.endsWith(".jpeg")) {
                error = error + "Please provide a jpeg/jpg/jpg image. "
            }

            if (error == "") {
                let db = MongoUtil.getDB()
                let results = await db.collection('listings').updateOne({
                    '_id': ObjectId(req.params.id)
                }, {
                    '$set': {
                        name, date_listed, description, flower_type, price, occasion, quantity, image, florist
                    }
                })

                console.log(results)
                res.status(200)
                res.send(results)
            } else {
                res.status(400)
                res.send(error)
            }

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

            let florist = await db.collection('florists').find({
                '$and': [{
                    '_id': { '$eq': ObjectId(req.body.florist_id) },
                    'login_email': { '$eq': req.body.login_email }
                }
                ]
            }).count()

            console.log(florist)

            if (florist == 1) {
                let results = await db.collection('listings').deleteOne({
                    '_id': ObjectId(req.params.id)
                })
                res.status(200);
                res.send(results);
            } else {
                res.status(400);
                res.send("Email or florist ID incorrect.")
            }

        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.log(e);
        }
    })

    // Read florists collection
    app.get('/florists', async (req, res) => {

        try {
            let db = MongoUtil.getDB();

            let florists = await db.collection('florists')
                .find({
                    username: req.query.username,
                    login_email: req.query.login_email
                })
                // .project({
                //     name: 1,
                //     contact: 1,
                //     contact_method: 1})
                .toArray();

            console.log(florists)

            if (florists == "") {
                res.status(400)
                res.send("Username or Login Email is incorrect / incomplete / not found. ")
            } else if (!florists == "") {
                res.status(200);
                res.send(florists);
            }
        } catch (e) {
            res.status(500);
            res.send({
                'error': "We have encountered an internal server error"
            })
        }
    })

    // Create florist document
    app.post('/florists', async (req, res) => {
        try {
            let name = req.body.name
            let username = req.body.username
            let login_email = req.body.login_email
            let contact_method = req.body.contact_method
            let number = req.body.number
            let instagram = req.body.instagram
            let facebook = req.body.facebook
            let contact = { number, instagram, facebook }

            let error = ""

            if (name.length < 1) {
                error = error + "Please provide name of florist. "
            }

            if (username.length < 8) {
                error = error + "Please provide username with at least 8 characters. "
            }

            if (!login_email.includes("@") || !login_email.includes(".")) {
                error = error + "Please provide a valid email address for login. "
            }

            if (contact_method.length < 1) {
                error = error + "Please choose at least one way to be contacted by buyers. "
            }

            if (contact_method.includes("whatsapp")) {
                if (number.length < 8) {
                    error = error + "Please provide a valid 8 digit contact number. "
                }
            }

            if (contact_method.includes("instagram")) {
                if (!instagram.includes("instagram.com")) {
                    error = error + "Please enter a valid Instagram URL. "
                }
            }

            if (contact_method.includes("facebook")) {
                if (!facebook.includes("facebook.com")) {
                    error = error + "Please enter a valid Facebook URL. "
                }
            }

            if (error == "") {
                let db = MongoUtil.getDB();
                let result = await db.collection('florists').insertOne({
                    name, contact, username, login_email, contact_method
                })

                // inform the client that the process is successful
                res.status(200);
                res.json(result);
            } else {
                res.status(400);
                res.json(error)
            }


        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.log(e);
        }
    })

    // Update florist (Update the whole document)
    app.put('/florists/:id', async (req, res) => {
        try {
            let name = req.body.name
            let username = req.body.username
            let login_email = req.body.login_email
            let contact_method = req.body.contact_method
            let number = req.body.number
            let instagram = req.body.instagram
            let facebook = req.body.facebook
            let contact = { number, instagram, facebook }

            let error = ""

            if (name.length < 1) {
                error = error + "Please provide name of florist. "
            }

            if (username.length < 8) {
                error = error + "Please provide username with at least 8 characters. "
            }

            if (!login_email.includes("@") || !login_email.includes(".")) {
                error = error + "Please provide a valid email address for login. "
            }

            if (contact_method.length < 1) {
                error = error + "Please choose at least one way to be contacted by buyers. "
            }

            if (contact_method.includes("whatsapp")) {
                if (number.length < 8) {
                    error = error + "Please provide a valid 8 digit contact number. "
                }
            }

            if (contact_method.includes("instagram")) {
                if (!instagram.includes("instagram.com")) {
                    error = error + "Please enter a valid Instagram URL. "
                }
            }

            if (contact_method.includes("facebook")) {
                if (!facebook.includes("facebook.com")) {
                    error = error + "Please enter a valid Facebook URL. "
                }
            }

            let db = MongoUtil.getDB()
            let results = await db.collection('florists').updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$set': {
                    name, contact, contact_method, username, login_email
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

    // Delete florist
    app.delete('/florists/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let results = await db.collection('florists').remove({
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

}

main();

// START SERVER
// Deployment port: process.env.PORT
// Testing port: 3000
app.listen(process.env.PORT, () => {
    console.log("Server started")
})