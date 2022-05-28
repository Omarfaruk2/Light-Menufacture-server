lightShow
JnHk1xwKCOp8IjiJ
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0wfi.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })




async function run() {
    try {
        await client.connect()
        const toolsCollection = client.db("tools").collection("light")
        const reviewsCollection = client.db("tools").collection("reviews")
        const OrderCollection = client.db("tools").collection("order")
        const userCollection = client.db("tools").collection("users")



        app.get('/tool', async (req, res) => {
            const query = {}
            const cursor = toolsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })


        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await toolsCollection.findOne(query)
            res.send(result)
        })

        app.post("/order", async (req, res) => {
            // const id = req.params.id
            const info = req.body
            const result = await OrderCollection.insertOne(info)
            res.send(result)
        })

        app.get('/order/:email', async (req, res) => {

            const email = req.params.email
            const filter = { email: email }
            const cursor = OrderCollection.find(filter)
            const result = await cursor.toArray()
            res.send(result)
        })


        app.get('/review', async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })


        app.put("/user/:email", async (req, res) => {
            const email = req.params.email
            const user = req.body
            console.log(user, email)
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, options, updateDoc)
            res.send(result)
        })

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const result = await userCollection.findOne(filter)
            res.send(result)
        })




    }

    finally {

    }
}

run().catch(console.dir)

app.post("/", (req, res) => {
    res.send("Gemus Server Running")
})


// middleware
app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
    res.send("Running Genius Server hello")
})

app.listen(port, () => {
    console.log("Listening to port", port)
})
