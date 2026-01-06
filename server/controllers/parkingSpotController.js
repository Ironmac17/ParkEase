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

module.exports = {
  addSpot,
  batchCreateSpots,
  deleteSpot,
  toggleSpotStatus,
};