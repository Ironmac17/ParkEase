const mongoose = require("mongoose");

const parkingSpotSchema = new mongoose.Schema(
  {
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    isEV: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["available", "held", "occupied", "closed"],
      default: "available",
    },

    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    holdExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

parkingSpotSchema.index({ parkingLot: 1, label: 1 }, { unique: true });

module.exports = mongoose.model("ParkingSpot", parkingSpotSchema);
