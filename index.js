const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.xifd9dy.mongodb.net/?retryWrites=true&w=majority`;

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

    const nmSportsClassesCollection = client
      .db("nmSportsDB")
      .collection("classes");
    const nmSportsInstructorCollection = client
      .db("nmSportsDB")
      .collection("Instructors");
    const nmSportsUserCollection = client.db("nmSportsDB").collection("users");
    const nmSportsSelectedClassesCollection = client.db("nmSportsDB").collection("selectedClasses");

    // classes apis
    app.get("/classes", async (req, res) => {
      const result = await nmSportsClassesCollection
        .find()
        .sort({ students: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/classes-page", async (req, res) => {
      const result = await nmSportsClassesCollection.find().toArray();
      res.send(result);
    });

    app.get("/instructors", async (req, res) => {
      const result = await nmSportsInstructorCollection.find().toArray();
      res.send(result);
    });

    // selected class apis
    app.post("/selected-classes", async (req, res) => {
      const classes = req.body;
      const result =  await nmSportsSelectedClassesCollection.insertOne(classes);
      res.send(result)
    });

    app.get("/selected-classes", async (req, res) => {
        
      const result =  await nmSportsSelectedClassesCollection.find().toArray();
      res.send(result)
    });

    app.get("/selected-classes/:email", async (req, res) => {
        const email =  req.params.email;
        if (!email) {
            res.send([]);
          }
        const query = {email : email};
      const result =  await nmSportsSelectedClassesCollection.find(query).toArray();
      
      res.send(result)
    });

     app.delete('/selected-classes/:id' , async(req, res) => {
        const id =  req.params.id;
        
        const filter =  {_id: new ObjectId(id)};
        const result =  await nmSportsSelectedClassesCollection.deleteOne(filter);
        res.send(result)
     })

    // user apis
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      
      const query = { email: email };
      const user = await nmSportsUserCollection.findOne(query);
      
      const result = {
        admin: user?.role === "admin",
        instructor: user?.role === "instructor",
      };
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exertingUser = await nmSportsUserCollection.findOne(query);
      if (exertingUser) {
        return res.send({ message: "User Already added " });
      }
      const result = await nmSportsUserCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("sports academy ");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
