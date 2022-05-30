// lightShow
// JnHk1xwKCOp8IjiJ
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()
const jwt = require('jsonwebtoken')
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0wfi.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function verifyJWT(req, res, next) {
    const authheader = req.headers.authorization
    if (!authheader) {
        return res.status(401).send({ message: "Unauthorize access" })
    }
    const token = authheader.split(" ")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" })
        }
        req.decoded = decoded
        next()

    })

}


async function run() {
    try {
        await client.connect()
        const toolsCollection = client.db("tools").collection("light")
        const reviewsCollection = client.db("tools").collection("reviews")
        const OrderCollection = client.db("tools").collection("order")
        const userCollection = client.db("tools").collection("users")

        const newuserCollection = client.db("tools").collection("newusers")



        app.put("/newusers/:email", async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }
            const result = await newuserCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token })
        })

        app.put("/newusers/admin/:email", verifyJWT, async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const updateDoc = {
                $set: { role: "admin" }
            }
            const result = await newuserCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email
            const user = await newuserCollection.findOne({ email: email })
            const isAdmin = user.role === "admin"
            res.send({ admin: isAdmin })
        })

        app.get('/tool', async (req, res) => {
            const query = {}
            const cursor = toolsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // // Add Items prodects
        app.post('/tool', async (req, res) => {
            const newItem = req.body
            const result = await toolsCollection.insertOne(newItem)
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


        // new
        app.get("/order", async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email
            if (email === decodedEmail) {

                const query = { email: email }
                const order = await OrderCollection.find(query).toArray()
                return res.send(order)
            }
            else {
                return res.status(403).send({ message: "Forbidden access" })
            }
        })
        // new end

        app.get("/newusers", verifyJWT, async (req, res) => {
            const users = await newuserCollection.find().toArray()
            res.send(users)
        })



        app.get('/order/:email', verifyJWT, async (req, res) => {

            const email = req.params.email
            const filter = { email: email }
            const cursor = OrderCollection.find(filter)
            const result = await cursor.toArray()
            res.send(result)
        })
        // delecte order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await OrderCollection.deleteOne(query)
            res.send(result)
        })


        // deleted itemms
        app.delete('/tool/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await toolsCollection.deleteOne(query)
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
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
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
