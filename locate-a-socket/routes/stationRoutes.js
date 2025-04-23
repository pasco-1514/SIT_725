// routes/stationRoutes.js
const express = require("express");
const router = express.Router();

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

// Get a specific station
router.get("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res
        .status(503)
        .json({ message: "Database connection not available" });
    }

    const { ObjectId } = require("mongodb");
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

module.exports = router;
