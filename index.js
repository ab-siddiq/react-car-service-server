const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
console.log(process.env.DB_USER);
//middleware
app.use(cors()); //cors origin
app.use(express.json()); //convert req.body to json

app.get("/", (req, res) => {
  res.send("server is running!!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gjnzlrq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const serviceCollection = client.db("carService").collection("services");
    const bookingCollection = client.db("carService").collection("bookings");
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      console.log("get id", id);
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, price: 1, service_id: 1 },
      };
      try {
        const result = await serviceCollection.findOne(query, options);
        console.log("q:", query);
        console.log("r:", result);

        if (!result) {
          return res.status(404).send("Service not found");
        }

        res.send(result);
      } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Server error");
      }
    });
    app.post('/bookings',async(req,res)=>{
      const booking = req.body
      console.log(booking)
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`listering to port ${port}`);
});
