const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware:
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8su0x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected');
        const database = client.db("GreenHome");
        const housesCollection = database.collection("buyers");
        const bookingCollection = database.collection("bookings");

        // GET API 
        app.get('/houses', async (req, res) => {
            const cursor = housesCollection.find({});
            const houses = await cursor.toArray();
            res.send(houses);
        });

        // GET SINGLE SERVICE 
        app.get('/houses/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const house = await housesCollection.findOne(query);
            res.json(house);
        })

        // POST API 
        app.post('/houses', async (req, res) => {
            const house = req.body;
            console.log('hit the post api', house);
            const result = await housesCollection.insertOne(house);
            console.log(result);
            res.json(result);
        });

        // DELETE API   
        app.delete('/houses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await housesCollection.deleteOne(query);
            res.json(result);
        });

        // Add Booking API 
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        })

        // GET Bookings 
        app.get('/myApartments/:email', async (req, res) => {
            const result = await bookingCollection.find({ email: req.params.email, }).toArray();
            res.send(result);
        })

        //Delete Booking
        app.delete('/myApartments/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await bookingCollection.deleteOne({ email: req.params.email });
            res.send(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})