// app.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectDB = require("./dbConnect");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection variables
let dbClient;
let db;

// Connect to MongoDB at startup
// Part of your app.js file
(async function () {
  try {
    const connection = await connectDB();
    if (connection) {
      dbClient = connection.client;
      db = connection.db;

      // Make db available to route handlers
      app.locals.db = db;

      console.log("Database connection established and available to routes");
    } else {
      console.log("Running without database connection");
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    // Continue running even if database connection fails
  }
})();

// Add a graceful shutdown handler
process.on("SIGINT", async () => {
  if (dbClient) {
    await dbClient.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "locate-a-socket-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true in production with HTTPS
  })
);

// Define routes
const stationRoutes = require("./routes/stationRoutes");
const userRoutes = require("./routes/userRoutes");
const routeRoutes = require("./routes/routeRoutes");

// API routes
app.use("/api/stations", stationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/routes", routeRoutes);

// View routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Locate a Socket - EV Charging Station Finder",
    user: req.session.user || null,
  });
});

app.get("/map", (req, res) => {
  res.render("map", {
    title: "Find Charging Stations",
    user: req.session.user || null,
  });
});

app.get("/route", (req, res) => {
  res.render("route", {
    title: "Plan Your Route",
    user: req.session.user || null,
  });
});

app.get("/profile", (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.render("profile", {
    title: "User Profile",
    user: req.session.user,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
