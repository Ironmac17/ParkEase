const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema(
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
        type: [Number],
        required: true,
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    baseRate: {
      type: Number,
      required: true,
      min: 1,
    },

    weekendMultiplier: {
      type: Number,
      default: 1.2, 
      min: 1,
    },

    festivalMultiplier: {
      type: Number,
      default: 1.5,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    totalSpots: {
      type: Number,
      default: 0,
    },

    evSpots: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

parkingLotSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ParkingLot", parkingLotSchema);
