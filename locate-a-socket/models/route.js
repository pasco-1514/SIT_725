const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    startPoint: {
      name: String,
      coordinates: [Number], // [longitude, latitude]
    },
    endPoint: {
      name: String,
      coordinates: [Number], // [longitude, latitude]
    },
    totalDistance: Number, // in km
    totalDuration: Number, // in minutes
    chargingStops: [
      {
        station: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Station",
        },
        arrivalBattery: Number, // percentage
        chargeDuration: Number, // in minutes
        departBattery: Number, // percentage
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Route", RouteSchema);
