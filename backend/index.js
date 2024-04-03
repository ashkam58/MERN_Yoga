const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

//ashkam58
//m9iQMNeSFgmEmnsS
//mongodb+srv://ashkam58:<password>@yoga-master.lcddpho.mongodb.net/

//MONGODB


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master.lcddpho.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    
    //Creating database and collections
    const database = client.db("yoga-master");
    const usersCollections = database.collection("users");
    const classesCollections = database.collection("classes");
    const cartCollections = database.collection("cart");
    const paymentCollections = database.collection("payment");
    const enrolledCollections = database.collection("enrolled");
    const appliedCollections = database.collection("applied");
    
    //Routes
    app.post('/new-class', async(req, res)=>{
      const newClass = req.body;
      const result = await classesCollections.insertOne(newClass)
      res.send(result);
    })
    app.get('/classes', async(req, res)=>{
      const query = {status: 'approved'}
      const result = await classesCollections.find().toArray()
      res.send(result)
    })

    //get classes by instructor email
    app.get('/classes/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {instructorEmail: email};
      const result = await classesCollections.find(query).toArray();
      res.send(result)

    })

    //manage classes 
    app.get('/classes-manage', async(req, res)=>{
      const result = await classesCollections.find.toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  client.connect();
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Hello World')
})

app.listen(port, ()=>{
    console.log('app is listening to the port 5000')
})