const Festival = require("../models/Festival");

const getFestivals = async (req, res) => {
  const festivals = await Festival.find().sort({ startDate: 1 });
  res.json(festivals);
};

const createFestival = async (req, res) => {
  const { name, startDate, endDate, multiplier } = req.body;

  if (!name || !startDate || !endDate || multiplier < 1) {
    return res.status(400).json({ message: "Invalid festival data" });
  }

  const festival = await Festival.create({
    name,
    startDate,
    endDate,
    multiplier,
  });

  res.status(201).json(festival);
};

const deleteFestival = async (req, res) => {
  await Festival.findByIdAndDelete(req.params.id);
  res.json({ message: "Festival deleted" });
};

module.exports = { getFestivals, createFestival, deleteFestival };
