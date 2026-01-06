const Vehicle = require("../models/Vehicle");

const getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  res.json(vehicles);
};

const addVehicle = async (req, res) => {
  const { make, model, licensePlate, color, type } = req.body;

  if (!make || !model || !licensePlate) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const existing = await Vehicle.findOne({
    owner: req.user._id,
    licensePlate: licensePlate.toUpperCase(),
  });

  if (existing) {
    return res.status(400).json({ message: "Vehicle already exists" });
  }

  const vehicle = await Vehicle.create({
    owner: req.user._id,
    make,
    model,
    licensePlate,
    color,
    type,
  });

  res.status(201).json(vehicle);
};

const deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  if (vehicle.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await vehicle.deleteOne();

  res.json({ message: "Vehicle deleted" });
};


const setDefaultVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  if (vehicle.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Vehicle.updateMany(
    { owner: req.user._id },
    { isDefault: false }
  );

  vehicle.isDefault = true;
  await vehicle.save();

  res.json(vehicle);
};

module.exports = {
  getVehicles,
  addVehicle,
  deleteVehicle,
  setDefaultVehicle,
};
