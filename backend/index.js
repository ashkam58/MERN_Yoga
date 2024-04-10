const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_PASSWORD);
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Verify token
// const verifyJWT = (req, res, next) =>{
//   const authorization = req.headers.authorization;
//   if(!authorization){
//     return res.status(401).send({meassage: 'Invalid authorization'})
//   }

//   const token = authorization?.split
// }


//MONGODB

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master.lcddpho.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master`;

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
    //Creating database and collections
    const database = client.db("yoga-master");
    const usersCollections = database.collection("users");
    const classesCollections = database.collection("classes");
    const cartCollections = database.collection("cart");
    const paymentCollections = database.collection("payment");
    const enrolledCollections = database.collection("enrolled");
    const appliedCollections = database.collection("applied");
    
    
        //routes for users

      app.post("/api/set-token", async (req, res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ASSESS_SECURITY, {
          expiresIn: '24h'
        });
        res.send({token})
      })


        app.post('/new-user', async (req, res)=>{
          const newUser = req.body;
          const result = await usersCollections.insertOne(newUser);
          res.send(result);
        })
    
        app.get('/users', async (req, res)=>{
          const result = await usersCollections.find({}).toArray();
          res.send(result);
        })

        app.get('/users/:id', async (req, res)=>{
          const id = req.params.id;
          const query = await usersCollections.find(query).toArray();
          const result= await usersCollections.findOne(query);
          res.send(result);
        })

        app.get('/user/:email', async (req, res)=>{
          const email = req.params.email;
          const query = {email: email};
          const result = await usersCollections.findOne(query);
          res.send(result);
        })
 
        app.delete('/delete-user/:id', async (req, res)=>{

        })


    //Routes
    app.post("/new-class", async (req, res) => {
      const newClass = req.body;
      try {
        const result = await classesCollections.insertOne(newClass);
        res.send(result);
      } catch (error) {
        console.error("Error inserting document:", error.message);
        res.status(500).send("Internal server error");
      }
    }) *
      app.get("/classes", async (req, res) => {
        const query = { status: "approved" };
        const result = await classesCollections.find().toArray();
        res.send(result);
      });

    //get classes by instructor email
    app.get("/classes/:email", async (req, res) => {
      const email = req.params.email;
      const query = { instructorEmail: email };
      const result = await classesCollections.find(query).toArray();
      res.send(result);
    });

    //manage classes
    app.get("/classes-manage", async (req, res) => {
      const result = await classesCollections.find.toArray();
      res.send(result);
    });

    //update classes status and reason
    app.patch("/change-status/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: status,
          reason: reason,
        },
      };
      const result = await classesCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //get approved classes

    app.get("/approved-classes", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollections.find(query).toArray();
      res.send(result);
    });

    // get single class details
    app.get("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollections.findOne(query);
      res.send(result);
    });

    //update class details (all date)
    app.put("/update-class/:id", async (req, res) => {
      const id = req.params.id;
      const updateclass = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateclass.name,
          description: updateclass.description,
          price: updateclass.price,
          availableSeats: parseInt(updateclass.availableSeats),
          videoLink: updateclass.videoLink,
          status: "pending",
        },
      };
      const result = await classesCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Cart Routes !---
    app.post("/add-to-cart", async (req, res) => {
      const newCartItem = req.body;
      const result = await cartCollections.insertOne(newCartItem);
      res.send(result);
    });

    // get cart item by id

    app.get("/cart-item/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.body.email;
      const query = {
        classId: id,
        userMail: email,
      };
      const projection = { classId: 1 };
      const result = await cartCollections.findOne(query, {
        projection: projection,
      });
      res.send(result);
    });

    // Cart information by user email
    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userMail: email };
      const projection = { classId: 1 };
      const carts = await cartCollections.find(query, {
        projection: projection,
      });
      const classIds = carts.map((cart) => {
        new ObjectId(cart.classId);
      });
      const query2 = { _id: { $in: classIds } };
      const result = await classesCollections.find(query2).toArray();
      res.send(result);
    });

    //delete cart item
    app.delete("/delete-cart-item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { classId: id };
      const result = await cartCollections.deleteOne(query);
      res.send(result);
    });

    //PAYMENT ROUTE
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntent.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //post payment info to db
    app.post("/payment-info", async (req, res) => {
      const paymentInfo = req.body;
      const classesId = paymentInfo.classesId;
      const userEmail = paymentInfo.userEmail;
      const singleClassId = req.query.classId;
      let query;

      if (singleClassId) {
        query = { classId: singleClassId, userMail: userEmail };
      } else {
        query = { classId: { $in: classesId } };
      }

      const classesQuery = {
        _id: { $in: classesId.map((id) => new ObjectId(id)) },
      };
      const classes = await classesCollections.find(classesQuery).toArray();
      const newEnrolledData = {
        userMail: userEmail,
        classId: singleClassId.map((id) => new ObjectId(id)),
        transactionId: paymentInfo.transactionId,
      };
      const updatedDoc = {
        $set: {
          totalEnrolled:
            classes.reduce(
              (total, current) => total + current.totalEnrolled,
              0
            ) + 1 || 0,
          availableSeats:
            classes.reduce(
              (total, current) => total + current.availableSeats,
              0
            ) - 1 || 0,
        },
      };

      const updatedResult = await classesCollections.updateMany(
        classesQuery,
        updatedDoc,
        { upsert: true }
      );
      const enrolledResult = await enrolledCollections.insertOne(
        newEnrolledData
      );
      const deletedResult = await cartCollections.deleteMany(query);
      const paymentResult = await paymentCollections.insertOne(paymentInfo);

      res.send({ paymentResult, deletedResult, enrolledResult, updatedResult });
    });

    // get payment history

    app.get("/payment-history/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userMail: email };
      const result = await paymentCollections
        .find(query)
        .sort({ data: -1 })
        .toArray();
      res.send(result);
    });

    // Payment history length

    app.get("/payment-history-length/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userMail: email };
      const total = await paymentCollections.countDocuments(query);
      res.send({ total });
    });

    //Enrollment routes
    app.get("/popular-classes", async (req, res) => {
      const result = await classesCollections
        .find()
        .sort({ totalEnrolled: -1 }.limit(6))
        .toArray();
      res.send(result);
    });

    app.get("/popular-instructors", async (req, res) => {
      const pipeline = [
        {
          $group: {
            _id: "$instructorEmail",
            totatlEnrolled: { $sum: "$totalEnrolled" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignFiled: "email",
            as: "instructor",
          },
        },
        {
          $project: {
            _id: 0,
            instructor: {
              $arrayElemAt: ["$instructor", 0],
            },
            totalEnrolled: 1,
          },
        },
        {
          $sort: {
            totalEnrolled: -1,
          },
        },
        {
          $limit: 6,
        },
      ];
      const result = await classesCollections.aggregate(pipeline).toArray
      ();
      res.send(result);
    });

    //Admin status

    app.get('/admin-stats', async (req, res)=>{
        const approvedClasses = ((await classesCollections.find({status: "approved"})).toArray()).length;
        const pendingClasses = (await ((await classesCollections.find({status: "pending"})).toArray())).length;
        const instructor = (await ((await usersCollections.find({role: "instructor"})).toArray())).length;
        const totalClasses = (await classesCollections.find().toArray.length);
        const totalEnrolled =(await classesCollections.indexInformation().toArray()).length;

        const result = {
          approvedClasses,
          pendingClasses,
          instructor,
          totalClasses,
          totalEnrolled
        }
        res.send(result);
    });

    //Get all instructor

    app.get('/instructors', async (req, res) =>{
      const result = await usersCollections.find({role: 'instructor'}).toArray();
    })

    app.get('/enrolled-classes/:email', async (req, res)=>{
      const email = req.params.email;
      const query = { userMail: email};
      const pipeline = [
        {
          $match: query
        },
        {
          $lookup: {
            from: "classes",
            localField: "classesId",
            foreignField: "_id",
            as: "classes"
          }
        },
        {
          $unwind: "$classes"
        }, {
          from: "users",
          localField: "classes.instructorEmail",
          foreignField: "email",
          as: "instructor"
        }, {
          $project: {
            _id: 0,
            instructor: {
              $arrayElemAt: ["$instructor", 0]
            },
            classes: 1
          }
        }
      ];

      const result = await enrolledCollections.aggregate(pipeline).toArray();
      res.send(result);
    })

    //applied for instructors
    app.post('/ass-instructor', async (req,res)=>{
      const data = req.body;
      const result = await appliedCollections.insertOne(data);
      res.send(result);
    })

    app.get('/applied-instructors/:email', async (req,res)=>{
      const email = req.params.email;
      const result = await appliedCollections.findOne({email});
      res.send(result);
    })


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
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("app is listening to the port 5000");
});
