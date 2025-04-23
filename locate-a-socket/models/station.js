const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    connectors: [
      {
        type: {
          type: String,
          enum: ["CCS", "CHAdeMO", "Type2", "Tesla"],
          required: true,
        },
        power: {
          type: Number, // kW
          required: true,
        },
        count: {
          type: Number,
          default: 1,
        },
        available: {
          type: Number,
          default: 1,
        },
      },
    ],
    amenities: {
      restroom: Boolean,
      food: Boolean,
      wifi: Boolean,
      shopping: Boolean,
    },
    network: {
      type: String,
      enum: ["ChargeCo", "EVgo", "Tesla", "ChargePoint", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    cost: {
      type: String,
      default: "$0.35/kWh",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for geospatial queries
StationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Station", StationSchema);
