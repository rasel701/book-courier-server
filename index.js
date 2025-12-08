const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");

const serviceAccount = require("./book-courier-7c825-firebase.json");
const port = 3000;

app.use(express.json());
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyFBToken = async (req, res, next) => {
  const token = req.headers.authorization;
  console.log("This is a token");
  if (!token) {
    return res.status(401).send({ emssage: "unauthoized user" });
  }
  try {
    const idToken = token.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.decoded_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8tne59p.mongodb.net/?appName=Cluster0`;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const db = client.db("book_courier_db");
    const userCollection = db.collection("users");
    const booksCollection = db.collection("books");
    const serviceCollection = db.collection("serviceCenter");
    const bookOredrCollection = db.collection("bookOrders");

    //  USER SECTION

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const { displayName, email, photoURL } = req.body;
      const role = "user";
      const createdAt = new Date();

      const user = {
        displayName,
        email,
        photoURL,
        role,
        createdAt,
      };

      const userExist = await userCollection.findOne({ email });

      if (userExist) {
        return res.send({ message: "user exists" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // BOOKS SECTION

    app.get("/books", async (req, res) => {
      const query = {};
      const result = await booksCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/books/:id", async (req, res) => {
      const { id } = req.params;

      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    // BOOK ORDER

    app.post("/book-order", async (req, res) => {
      const orderData = req.body;
      const { bookId, name, email } = orderData;
      const query = { _id: new ObjectId(bookId) };

      const orderItem = {
        order_user_name: name,
        order_user_email: email,
        createdAt: new Date(),
      };

      const bookResult = await booksCollection.updateOne(query, {
        $push: { orders: orderItem },
      });
      const result = await bookOredrCollection.insertOne(orderData);
      res.send(result);
    });

    app.get("/book-order/:email", verifyFBToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      console.log("email is ", email);
      console.log("decoded email", req.decoded_email);
      const result = await bookOredrCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/book-order", async (req, res) => {
      const result = await bookOredrCollection.find().toArray();
      res.send(result);
    });

    // BOOK REVIEW

    app.patch("/book-rating-review", async (req, res) => {
      const bookData = req.body;

      console.log(bookData);
      const query = { _id: new ObjectId(bookData.bookId) };
      const book = await booksCollection.findOne(query);
      const reviews = book.reviews || [];

      const isExist = reviews.find(
        (rev) => rev.reviewer_email === bookData.reviewer_email
      );
      if (isExist) {
        return res
          .status(400)
          .send({ message: "You already reviewed this book!" });
      }

      const result = await booksCollection.updateOne(query, {
        $push: { reviews: bookData },
      });
      res.send(result);
    });

    // Service Center

    app.get("/service-center", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
