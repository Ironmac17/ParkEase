const ParkingLot = require("../models/ParkingLot");
const ParkingSpot = require("../models/ParkingSpot");

const createParkingLot = async (req, res) => {
  const {
    name,
    address,
    location,
    baseRate,
    weekendMultiplier,
    festivalMultiplier,
  } = req.body;

  if (!name || !address || !location || !baseRate) {
    return res.status(400).json({ message: "All required fields missing" });
  }

  if (baseRate <= 0) {
    return res.status(400).json({ message: "Base rate must be positive" });
  }

  if (weekendMultiplier && weekendMultiplier < 1) {
    return res
      .status(400)
      .json({ message: "Weekend multiplier must be ≥ 1" });
  }

  if (festivalMultiplier && festivalMultiplier < 1) {
    return res
      .status(400)
      .json({ message: "Festival multiplier must be ≥ 1" });
  }

  const parkingLot = await ParkingLot.create({
    name,
    address,
    location,
    baseRate,
    weekendMultiplier,
    festivalMultiplier,
    owner: req.user._id,
  });

  res.status(201).json(parkingLot);
};

const getParkingLots = async (req, res) => {
  const lots = await ParkingLot.find({ isActive: true }).lean();
  const lotIds = lots.map((l) => l._id);

  const spots = await ParkingSpot.aggregate([
    { $match: { parkingLot: { $in: lotIds } } },
    {
      $group: {
        _id: "$parkingLot",
        totalSpots: { $sum: 1 },
        freeSpots: {
          $sum: {
            $cond: [{ $eq: ["$status", "available"] }, 1, 0],
          },
        },
        evSpots: {
          $sum: { $cond: ["$isEV", 1, 0] },
        },
      },
    },
  ]);

  const statsMap = {};
  spots.forEach((s) => {
    statsMap[s._id.toString()] = s;
  });

  const response = lots.map((lot) => {
    const s = statsMap[lot._id.toString()] || {
      totalSpots: 0,
      freeSpots: 0,
      evSpots: 0,
    };

    return {
      ...lot,
      stats: {
        totalSpots: s.totalSpots,
        freeSpots: s.freeSpots,
        evSpots: s.evSpots,
        occupancyRate:
          s.totalSpots === 0
            ? 0
            : Math.round(
                ((s.totalSpots - s.freeSpots) / s.totalSpots) * 100
              ),
      },
    };
  });

  res.json(response);
};

const getParkingLotById = async (req, res) => {
  const lot = await ParkingLot.findById(req.params.id).lean();

  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  const stats = await ParkingSpot.aggregate([
    { $match: { parkingLot: lot._id } },
    {
      $group: {
        _id: "$parkingLot",
        totalSpots: { $sum: 1 },
        freeSpots: {
          $sum: {
            $cond: [{ $eq: ["$status", "available"] }, 1, 0],
          },
        },
        evSpots: {
          $sum: { $cond: ["$isEV", 1, 0] },
        },
      },
    },
  ]);

  const s = stats[0] || { totalSpots: 0, freeSpots: 0, evSpots: 0 };

  res.json({
    ...lot,
    stats: {
      totalSpots: s.totalSpots,
      freeSpots: s.freeSpots,
      evSpots: s.evSpots,
      occupancyRate:
        s.totalSpots === 0
          ? 0
          : Math.round(
              ((s.totalSpots - s.freeSpots) / s.totalSpots) * 100
            ),
    },
  });
};

const getOwnerParkingLots = async (req, res) => {
  const lots = await ParkingLot.find({ owner: req.user._id });
  res.json(lots);
};

const updateParkingLot = async (req, res) => {
  const lot = await ParkingLot.findById(req.params.id);

  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  if (lot.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const allowedUpdates = [
    "name",
    "address",
    "location",
    "baseRate",
    "weekendMultiplier",
    "festivalMultiplier",
    "isActive",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      lot[field] = req.body[field];
    }
  });

  if (lot.baseRate <= 0) {
    return res.status(400).json({ message: "Base rate must be positive" });
  }

  if (lot.weekendMultiplier < 1) {
    return res
      .status(400)
      .json({ message: "Weekend multiplier must be ≥ 1" });
  }

  if (lot.festivalMultiplier < 1) {
    return res
      .status(400)
      .json({ message: "Festival multiplier must be ≥ 1" });
  }

  await lot.save();
  res.json(lot);
};

module.exports = {
  createParkingLot,
  getParkingLots,
  getParkingLotById,
  getOwnerParkingLots,
  updateParkingLot,
};
