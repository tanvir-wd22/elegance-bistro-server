// ===== STEP 1: Import the tools we need =====
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// ===== STEP 2: Read the .env file =====
dotenv.config();

// ===== STEP 3: Create the server =====
const app = express();
const port = process.env.PORT || 3000;

// ===== STEP 4: Middlewares =====
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://elegant-bistro.web.app"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// ===== STEP 5: Set up the database connection =====
const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.oko4eb5.mongodb.net/`,
);

// global declaretion of database and collections
const database = client.db("elegantBistroDB");
const menusCollection = database.collection("menus");
const reviewsCollection = database.collection("reviews");
const cartsCollection = database.collection("carts");

// ===== STEP 6: Function to CONNECT to the database =====
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw error; // pass the error along so the server won't start
  }
}

// ===== STEP 7: Function to DISCONNECT from the database =====
async function disconnectFromMongoDB() {
  console.log("Closing MongoDB connection...");
  await client.close();
}

// ===== STEP 8: Routes (the URLs server answers) =====
app.get("/", (req, res) => {
  res.send("Our server is running!");
});

// --- MENUS RESOURCE ---
app.get("/menus", async (req, res) => {
  try {
    const menusData = await menusCollection.find().toArray();
    res.send(menusData);
  } catch (error) {
    console.log("menus data get error", error);
    res.status(500).send({ message: "menus data get error" });
  }
});

// --- REVIEWS RESOURCE ---
app.get("/reviews", async (req, res) => {
  try {
    const reviewsData = await reviewsCollection.find().toArray();
    res.send(reviewsData);
  } catch (error) {
    console.log("reviews data get error:", error);
    res.status(500).send({ message: "reviews data get error" });
  }
});

// --- CARTS RESOURCE ---
app.get("/carts", async (req, res) => {
  try {
    const query = { buyerEmail: req.query.email };
    const cartsData = await cartsCollection.find(query).toArray();
    res.send(cartsData);
  } catch (error) {
    console.log("carts data get error", error);
    res.status(500).send({ message: "carts data get error" });
  }
});

app.post("/carts", async (req, res) => {
  try {
    const cartItem = req.body;
    const result = await cartsCollection.insertOne(cartItem);
    res.send(result);
  } catch (error) {
    console.log("carts data post error", error);
    res.status(500).send({ message: "carts data post error" });
  }
});

// ===== STEP 9: Start everything =====
async function startServer() {
  try {
    // 1st: connect to the database
    await connectToMongoDB();

    app.listen(port, () => {
      // 2nd: start the server
      console.log(`Server is running on port: ${port}`);
    });
  } catch (error) {
    // stop the program if something failed
    process.exit(1);
  }
}

startServer();

// ===== STEP 10: Clean shutdown =====
// When you press Ctrl + C, disconnect from the database before quitting
process.on("SIGINT", async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});
