const ParkingLot = require("../models/ParkingLot");
const ParkingSpot = require("../models/ParkingSpot");

const addSpot = async (req, res) => {
  const { label, isEV } = req.body;
  const { id: parkingLotId } = req.params;

  if (!label) {
    return res.status(400).json({ message: "Spot label is required" });
  }

  const lot = await ParkingLot.findById(parkingLotId);
  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  if (lot.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const spot = await ParkingSpot.create({
    parkingLot: parkingLotId,
    label,
    isEV: !!isEV,
  });

  // update counters
  lot.totalSpots += 1;
  if (isEV) lot.evSpots += 1;
  await lot.save();

  res.status(201).json(spot);
};

const batchCreateSpots = async (req, res) => {
  const { rows, spotsPerRow, evSpots = [] } = req.body;
  const { id: parkingLotId } = req.params;

  if (!rows || !spotsPerRow) {
    return res.status(400).json({ message: "rows and spotsPerRow required" });
  }

  const lot = await ParkingLot.findById(parkingLotId);
  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  if (lot.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const spots = [];

  for (let r = 0; r < rows; r++) {
    const rowChar = String.fromCharCode(65 + r); // A, B, C...

    for (let s = 1; s <= spotsPerRow; s++) {
      const label = `${rowChar}${s}`;
      spots.push({
        parkingLot: parkingLotId,
        label,
        isEV: evSpots.includes(label),
      });
    }
  }

  const createdSpots = await ParkingSpot.insertMany(spots, { ordered: false });

  const evCount = createdSpots.filter((s) => s.isEV).length;

  lot.totalSpots += createdSpots.length;
  lot.evSpots += evCount;
  await lot.save();

  res.status(201).json({
    created: createdSpots.length,
    evSpots: evCount,
  });
};

const deleteSpot = async (req, res) => {
  const { spotId } = req.params;

  const spot = await ParkingSpot.findById(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot not found" });
  }

  const lot = await ParkingLot.findById(spot.parkingLot);
  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  if (lot.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await spot.deleteOne();

  // update counters
  lot.totalSpots -= 1;
  if (spot.isEV) lot.evSpots -= 1;
  await lot.save();

  res.json({ message: "Spot deleted successfully" });
};

const toggleSpotStatus = async (req, res) => {
  const { spotId } = req.params;
  const { action } = req.body; // "close" or "open"

  const spot = await ParkingSpot.findById(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot not found" });
  }

  const lot = await ParkingLot.findById(spot.parkingLot);
  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  if (lot.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (action === "close") {
    if (spot.status === "occupied") {
      return res
        .status(400)
        .json({ message: "Cannot close an occupied spot" });
    }
    spot.status = "closed";
    spot.heldBy = null;
    spot.holdExpiresAt = null;
  }

  if (action === "open") {
    spot.status = "available";
  }

  await spot.save();

  // 🔔 socket update (important)
  global.io
    .to(`parking_lot_${spot.parkingLot}`)
    .emit("spot_update", {
      spotId: spot._id,
      status: spot.status,
    });

  res.json(spot);
};


const getParkingSpots = async (req, res) => {
  const { id: parkingLotId } = req.params;
  const now = new Date();

  // 1. Find expired held spots
  const expiredSpots = await ParkingSpot.find({
    parkingLot: parkingLotId,
    status: "held",
    holdExpiresAt: { $lt: now },
  });

  // 2. Release them
  if (expiredSpots.length > 0) {
    const expiredIds = expiredSpots.map((s) => s._id);

    await ParkingSpot.updateMany(
      { _id: { $in: expiredIds } },
      {
        $set: {
          status: "available",
          heldBy: null,
          holdExpiresAt: null,
        },
      }
    );

    // 3. Emit socket updates (important)
    expiredIds.forEach((spotId) => {
      global.io
        .to(`parking_lot_${parkingLotId}`)
        .emit("spot_update", {
          spotId,
          status: "available",
        });
    });
  }

  // 4. Fetch all spots for the lot
  const spots = await ParkingSpot.find({ parkingLot: parkingLotId }).sort({
    label: 1,
  });

  // If client passed a time window, mark spots that are booked during that window
  const { startTime, endTime } = req.query;
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const Booking = require("../models/Booking");

    // find bookings overlapping the window for this lot
    const overlapping = await Booking.find({
      parkingLot: parkingLotId,
      status: { $in: ["confirmed", "active"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).select("parkingSpot startTime endTime status user");

    const bookedSet = new Map();
    overlapping.forEach((b) => {
      bookedSet.set(b.parkingSpot.toString(), bookedSet.get(b.parkingSpot.toString()) || []);
      bookedSet.get(b.parkingSpot.toString()).push(b);
    });

    const augmented = spots.map((s) => {
      const sObj = s.toObject();
      const list = bookedSet.get(s._id.toString()) || [];
      sObj.isBookedForWindow = list.length > 0;
      sObj.bookingsForWindow = list.map((b) => ({
        _id: b._id,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        user: b.user,
      }));
      return sObj;
    });

    return res.json(augmented);
  }

  res.json(spots);
};

const getSpotSchedule = async (req, res) => {
  const { spotId } = req.params;

  const { date, startTime, endTime } = req.query;

  // Determine window: prefer explicit startTime/endTime, else use provided date (full day), else today
  let start, end;
  if (startTime && endTime) {
    start = new Date(startTime);
    end = new Date(endTime);
  } else if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    start = new Date(d);
    end = new Date(d);
    end.setHours(23, 59, 59, 999);
  } else {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    start = new Date(d);
    end = new Date(d);
    end.setHours(23, 59, 59, 999);
  }

  const Booking = require("../models/Booking");

  const bookings = await Booking.find({
    parkingSpot: spotId,
    status: { $in: ["confirmed", "active"] },
    startTime: { $lt: end },
    endTime: { $gt: start },
  })
    .select("startTime endTime status user amountPaid")
    .sort({ startTime: 1 })
    .populate("user", "username");

  res.json({ start, end, bookings });
};

const getSpotById = async (req, res) => {
  const { spotId } = req.params;

  const spot = await ParkingSpot.findById(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot not found" });
  }

  res.json(spot);
};

module.exports = {
  addSpot,
  batchCreateSpots,
  deleteSpot,
  toggleSpotStatus,
  getParkingSpots,
  getSpotById,
  getSpotSchedule,
};