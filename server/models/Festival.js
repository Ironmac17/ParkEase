const mongoose = require("mongoose");

const festivalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    multiplier: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);
festivalSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("Festival endDate must be after startDate"));
  }

  this.startDate.setHours(0, 0, 0, 0);
  this.endDate.setHours(23, 59, 59, 999);

  next();
});

festivalSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Festival", festivalSchema);