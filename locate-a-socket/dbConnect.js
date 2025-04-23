// dbConnect.js
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri ="";
// Create a MongoClient with more robust options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add these connection options for robustness
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  retryWrites: true,
  retryReads: true,
});

// Database connection function
const connectDB = async () => {
  try {
    // Connect the client to the server
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log("Successfully connected to MongoDB Atlas!");

    // Return the client and database for use in the application
    return {
      client,
      db: client.db("locate-a-socket"), // Specify your database name here
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Don't exit in development - allows app to run without DB
    console.log(
      "Application will continue running without database connection"
    );
    return null;
  }
};

module.exports = connectDB;
