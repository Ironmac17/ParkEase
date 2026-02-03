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
  // support time-aware availability and basic filters
  const { startTime, endTime, maxPrice, isEV } = req.query;

  const lotFilter = { isActive: true };
  if (maxPrice) {
    lotFilter.baseRate = { $lte: Number(maxPrice) };
  }

  let lots = await ParkingLot.find(lotFilter).lean();
  const lotIds = lots.map((l) => l._id);

  // If no time window provided, fall back to simple status counts
  if (!startTime || !endTime) {
    // Treat expired holds as available for reporting
    const now = new Date();
    const spots = await ParkingSpot.aggregate([
      { $match: { parkingLot: { $in: lotIds } } },
      {
        $group: {
          _id: "$parkingLot",
          totalSpots: { $sum: 1 },
          freeSpots: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "available"] },
                    { $and: [{ $eq: ["$status", "held"] }, { $lt: ["$holdExpiresAt", now] }] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          evSpots: { $sum: { $cond: ["$isEV", 1, 0] } },
        },
      },
    ]);

    const statsMap = {};
    spots.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    let response = lots.map((lot) => {
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
              : Math.round(((s.totalSpots - s.freeSpots) / s.totalSpots) * 100),
        },
      };
    });

    if (isEV === "true" || isEV === "1") {
      response = response.filter((r) => r.stats.evSpots > 0);
    }

    return res.json(response);
  }

  // Parse window
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Aggregate spots and whether they have overlapping bookings in the window
  const spotsAgg = await ParkingSpot.aggregate([
    { $match: { parkingLot: { $in: lotIds } } },
    {
      $lookup: {
        from: "bookings",
        let: { spotId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$parkingSpot", "$$spotId"] },
                  { $in: ["$status", ["confirmed", "active"]] },
                  { $lt: ["$startTime", end] },
                  { $gt: ["$endTime", start] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "overlaps",
      },
    },
    {
      $project: {
        parkingLot: 1,
        isEV: 1,
        isBooked: { $gt: [{ $size: "$overlaps" }, 0] },
      },
    },
    {
      $group: {
        _id: "$parkingLot",
        totalSpots: { $sum: 1 },
        freeSpots: { $sum: { $cond: [{ $eq: ["$isBooked", false] }, 1, 0] } },
        evSpots: { $sum: { $cond: ["$isEV", 1, 0] } },
        evFreeSpots: {
          $sum: { $cond: [{ $and: ["$isEV", { $eq: ["$isBooked", false] }] }, 1, 0] },
        },
      },
    },
  ]);

  const statsMap = {};
  spotsAgg.forEach((s) => {
    statsMap[s._id.toString()] = s;
  });

  let response = lots.map((lot) => {
    const s = statsMap[lot._id.toString()] || {
      totalSpots: 0,
      freeSpots: 0,
      evSpots: 0,
      evFreeSpots: 0,
    };

    return {
      ...lot,
      stats: {
        totalSpots: s.totalSpots,
        freeSpots: s.freeSpots,
        evSpots: s.evSpots,
        evFreeSpots: s.evFreeSpots || 0,
        occupancyRate:
          s.totalSpots === 0
            ? 0
            : Math.round(((s.totalSpots - s.freeSpots) / s.totalSpots) * 100),
      },
    };
  });

  if (isEV === "true" || isEV === "1") {
    response = response.filter((r) => r.stats.evFreeSpots > 0);
  }

  res.json(response);
};

const getParkingLotById = async (req, res) => {
  const lot = await ParkingLot.findById(req.params.id).lean();

  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  const now = new Date();
  const stats = await ParkingSpot.aggregate([
    { $match: { parkingLot: lot._id } },
    {
      $group: {
        _id: "$parkingLot",
        totalSpots: { $sum: 1 },
        freeSpots: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "available"] },
                  { $and: [{ $eq: ["$status", "held"] }, { $lt: ["$holdExpiresAt", now] }] },
                ],
              },
              1,
              0,
            ],
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
