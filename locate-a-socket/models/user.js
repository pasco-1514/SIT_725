const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    vehicles: [
      {
        make: String,
        model: String,
        year: Number,
        range: Number,
        connectorTypes: [String],
      },
    ],
    favoriteStations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
    ],
    savedRoutes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
