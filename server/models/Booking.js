const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      required: true,
      index: true,
    },

    parkingSpot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSpot",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "active", "completed", "cancelled"],
      default: "confirmed",
      index: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["wallet", "mock"],
      default: "wallet",
    },
    extraAmountPaid: {
      type: Number,
      default: 0,
    },

    actualEndTime: {
      type: Date,
    },
    checkedInAt: Date,
    checkedOutAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
