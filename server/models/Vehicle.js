const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    make: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    licensePlate: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    color: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["car", "bike", "suv", "ev"],
      default: "car",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index(
  { owner: 1, licensePlate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
