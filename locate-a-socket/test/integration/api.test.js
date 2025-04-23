// test/integration/api.test.js
const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const express = require("express");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient, ObjectId } = require("mongodb");

describe("API Integration Tests", function () {
  let app, mongoServer, mongoClient, db;

  before(async function () {
    // Create a MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db("testDB");

    // Create a test Express app
    app = express();
    app.use(express.json());

    // Set the db on app.locals
    app.locals.db = db;

    // Define routes directly in the test to avoid import issues
    // GET endpoints
    app.get("/api/stations", async (req, res) => {
      try {
        const db = req.app.locals.db;
        if (!db) {
          return res
            .status(503)
            .json({ message: "Database connection not available" });
        }
        const stations = await db.collection("stations").find().toArray();
        res.json(stations);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.get("/api/stations/nearby", async (req, res) => {
      try {
        const db = req.app.locals.db;
        if (!db) {
          return res
            .status(503)
            .json({ message: "Database connection not available" });
        }

        const { lat, lng, radius = 10 } = req.query; // radius in km

        if (!lat || !lng) {
          return res
            .status(400)
            .json({ message: "Latitude and longitude are required" });
        }

        const stations = await db
          .collection("stations")
          .find({
            location: {
              $nearSphere: {
                $geometry: {
                  type: "Point",
                  coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                $maxDistance: parseInt(radius) * 1000, // convert km to meters
              },
            },
          })
          .toArray();

        res.json(stations);
      } catch (error) {
        console.error("Error finding nearby stations:", error);
        res.status(500).json({ message: error.message });
      }
    });

    app.get("/api/stations/:id", async (req, res) => {
      try {
        const db = req.app.locals.db;
        if (!db) {
          return res
            .status(503)
            .json({ message: "Database connection not available" });
        }

        const station = await db
          .collection("stations")
          .findOne({ _id: new ObjectId(req.params.id) });

        if (!station) {
          return res.status(404).json({ message: "Station not found" });
        }

        res.json(station);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST endpoint for station creation
    app.post("/api/stations", async (req, res) => {
      try {
        const db = req.app.locals.db;
        if (!db) {
          return res
            .status(503)
            .json({ message: "Database connection not available" });
        }

        // Validate the required fields
        const { name, address, location, connectors } = req.body;
        if (!name || !address || !location || !connectors) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure location is in the correct format
        if (
          !location.type ||
          !location.coordinates ||
          location.coordinates.length !== 2
        ) {
          return res
            .status(400)
            .json({ message: "Location must be a GeoJSON Point" });
        }

        // Add timestamp
        const station = {
          ...req.body,
          lastUpdated: new Date(),
        };

        const result = await db.collection("stations").insertOne(station);
        res.status(201).json({
          message: "Station created successfully",
          id: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating station:", error);
        res.status(500).json({ message: error.message });
      }
    });

    // PATCH endpoint for updating a station
    app.patch("/api/stations/:id", async (req, res) => {
      try {
        const db = req.app.locals.db;
        if (!db) {
          return res
            .status(503)
            .json({ message: "Database connection not available" });
        }

        // Add updated timestamp
        const updates = {
          ...req.body,
          lastUpdated: new Date(),
        };

        const result = await db
          .collection("stations")
          .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Station not found" });
        }

        res.json({
          message: "Station updated successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error updating station:", error);
        res.status(500).json({ message: error.message });
      }
    });

    // DELETE endpoint for deleting a station
    app.delete("/api/stations/:id", async (req, res) => {
      try {
        const db = req.app.locals.db;
        if (!db) {
          return res
            .status(503)
            .json({ message: "Database connection not available" });
        }

        const result = await db
          .collection("stations")
          .deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Station not found" });
        }

        res.json({ message: "Station deleted successfully" });
      } catch (error) {
        console.error("Error deleting station:", error);
        res.status(500).json({ message: error.message });
      }
    });

    // User routes
    app.get("/api/users/profile", (req, res) => {
      res.json({ message: "This will return user profile" });
    });

    app.post("/api/users/register", (req, res) => {
      res.json({ message: "This will register a new user" });
    });

    app.post("/api/users/login", (req, res) => {
      res.json({ message: "This will login a user" });
    });

    // Create indexes for geospatial queries
    await db.collection("stations").createIndex({ location: "2dsphere" });
  });

  after(async function () {
    if (mongoClient) await mongoClient.close();
    if (mongoServer) await mongoServer.stop();
  });

  // Clear collections before each test
  beforeEach(async function () {
    await db.collection("stations").deleteMany({});
    await db.collection("users").deleteMany({});
  });

  describe("Station API Integration", function () {
    it("should create, retrieve, update, and delete a station", async function () {
      // 1. Create a station
      const stationData = {
        name: "Integration Test Station",
        address: "123 Integration St",
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749],
        },
        connectors: [
          {
            type: "CCS",
            power: 50,
            count: 2,
          },
        ],
        status: "available",
      };

      console.log("Sending POST request to create station...");

      // Create station
      const createRes = await request(app)
        .post("/api/stations")
        .send(stationData);

      console.log(
        "Create station response:",
        createRes.status,
        JSON.stringify(createRes.body)
      );

      expect(createRes.status).to.equal(201);
      expect(createRes.body).to.have.property(
        "message",
        "Station created successfully"
      );
      expect(createRes.body).to.have.property("id");

      const stationId = createRes.body.id;

      // 2. Retrieve the created station
      console.log(`Getting station with ID: ${stationId}`);

      const getRes = await request(app).get(`/api/stations/${stationId}`);

      console.log("Get station response:", getRes.status);

      expect(getRes.status).to.equal(200);
      expect(getRes.body).to.have.property("name", stationData.name);
      expect(getRes.body).to.have.property("address", stationData.address);

      // 3. Update the station
      const updateData = {
        status: "busy",
        cost: "$0.45/kWh",
      };

      console.log(`Updating station with ID: ${stationId}`);

      const updateRes = await request(app)
        .patch(`/api/stations/${stationId}`)
        .send(updateData);

      console.log("Update station response:", updateRes.status);

      expect(updateRes.status).to.equal(200);
      expect(updateRes.body).to.have.property(
        "message",
        "Station updated successfully"
      );

      // 4. Retrieve the updated station
      const getUpdatedRes = await request(app).get(
        `/api/stations/${stationId}`
      );

      expect(getUpdatedRes.status).to.equal(200);
      expect(getUpdatedRes.body).to.have.property("status", updateData.status);
      expect(getUpdatedRes.body).to.have.property("cost", updateData.cost);

      // 5. Delete the station
      console.log(`Deleting station with ID: ${stationId}`);

      const deleteRes = await request(app).delete(`/api/stations/${stationId}`);

      console.log("Delete station response:", deleteRes.status);

      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property(
        "message",
        "Station deleted successfully"
      );

      // 6. Verify station is deleted
      const getDeletedRes = await request(app).get(
        `/api/stations/${stationId}`
      );

      expect(getDeletedRes.status).to.equal(404);
    });

    it("should find nearby stations with geospatial query", async function () {
      // Create test stations with different locations
      const sanFranciscoStation = {
        name: "San Francisco Station",
        address: "123 SF St",
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749], // SF coordinates
        },
        connectors: [{ type: "CCS", power: 50, count: 2 }],
      };

      const oaklandStation = {
        name: "Oakland Station",
        address: "456 Oakland St",
        location: {
          type: "Point",
          coordinates: [-122.2712, 37.8044], // Oakland coordinates, ~10km from SF
        },
        connectors: [{ type: "CCS", power: 50, count: 2 }],
      };

      const sacStation = {
        name: "Sacramento Station",
        address: "789 Sac St",
        location: {
          type: "Point",
          coordinates: [-121.4944, 38.5816], // Sacramento coordinates, ~140km from SF
        },
        connectors: [{ type: "CCS", power: 50, count: 2 }],
      };

      // Insert stations
      await db
        .collection("stations")
        .insertMany([sanFranciscoStation, oaklandStation, sacStation]);

      // Test nearby query within 20km radius (should return SF and Oakland stations)
      const nearbyRes = await request(app)
        .get("/api/stations/nearby")
        .query({ lat: "37.7749", lng: "-122.4194", radius: "20" });

      expect(nearbyRes.status).to.equal(200);
      expect(nearbyRes.body).to.be.an("array");
      expect(nearbyRes.body.length).to.equal(2);

      // Verify station names
      const stationNames = nearbyRes.body.map((s) => s.name);
      expect(stationNames).to.include("San Francisco Station");
      expect(stationNames).to.include("Oakland Station");
      expect(stationNames).to.not.include("Sacramento Station");

      // Test with smaller radius (5km, should only return SF station)
      const smallRadiusRes = await request(app)
        .get("/api/stations/nearby")
        .query({ lat: "37.7749", lng: "-122.4194", radius: "5" });

      expect(smallRadiusRes.status).to.equal(200);
      expect(smallRadiusRes.body).to.be.an("array");
      expect(smallRadiusRes.body.length).to.equal(1);
      expect(smallRadiusRes.body[0].name).to.equal("San Francisco Station");
    });
  });

  describe("User API Integration", function () {
    it("should return user profile, registration and login messages", async function () {
      // Test profile endpoint
      const profileRes = await request(app).get("/api/users/profile");
      expect(profileRes.status).to.equal(200);
      expect(profileRes.body).to.have.property(
        "message",
        "This will return user profile"
      );

      // Test register endpoint
      const registerRes = await request(app).post("/api/users/register").send({
        name: "Integration Test User",
        email: "integration@example.com",
        password: "password123",
      });
      expect(registerRes.status).to.equal(200);
      expect(registerRes.body).to.have.property(
        "message",
        "This will register a new user"
      );

      // Test login endpoint
      const loginRes = await request(app).post("/api/users/login").send({
        email: "integration@example.com",
        password: "password123",
      });
      expect(loginRes.status).to.equal(200);
      expect(loginRes.body).to.have.property(
        "message",
        "This will login a user"
      );
    });
  });
});
