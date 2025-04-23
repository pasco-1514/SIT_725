// routes/stationRoutes.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

// Get all stations
router.get("/", async (req, res) => {
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
    console.error("Error fetching stations:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get nearby stations based on coordinates
router.get("/nearby", async (req, res) => {
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

    // Convert radius from km to meters for MongoDB
    const radiusInMeters = parseInt(radius) * 1000;

    const stations = await db
      .collection("stations")
      .find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: radiusInMeters,
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

// Get a specific station
router.get("/:id", async (req, res) => {
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
    console.error("Error fetching station:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new station
router.post("/", async (req, res) => {
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

// Update a station
router.patch("/:id", async (req, res) => {
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

// Delete a station
router.delete("/:id", async (req, res) => {
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

module.exports = router;
