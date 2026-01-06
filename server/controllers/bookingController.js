const Booking = require("../models/Booking");
const ParkingSpot = require("../models/ParkingSpot");
const Vehicle = require("../models/Vehicle");
const ParkingLot = require("../models/ParkingLot");
const { holdSpot, releaseSpot } = require("../utils/slotLock");

const createBooking = async (req, res) => {
  const { spotId, vehicleId, startTime, endTime } = req.body;

  if (!spotId || !vehicleId || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 1️⃣ Verify vehicle belongs to user
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Invalid vehicle" });
  }

  // 2️⃣ Hold the spot atomically
  const heldSpot = await holdSpot(spotId, req.user._id);
  if (!heldSpot) {
    return res
      .status(409)
      .json({ message: "Spot already held or unavailable" });
  }

  // 3️⃣ Double-check spot is not closed
  if (heldSpot.status === "closed") {
    await releaseSpot(spotId, req.user._id);
    return res.status(400).json({ message: "Spot is closed" });
  }

  // 4️⃣ Create booking
  const booking = await Booking.create({
    user: req.user._id,
    parkingLot: heldSpot.parkingLot,
    parkingSpot: heldSpot._id,
    vehicle: vehicleId,
    startTime,
    endTime,
    amountPaid: 0, // mock / wallet later
    paymentMethod: "mock",
  });

  // 5️⃣ Mark spot as occupied
  heldSpot.status = "occupied";
  heldSpot.heldBy = null;
  heldSpot.holdExpiresAt = null;
  await heldSpot.save();

  // 🔔 Socket updates
  global.io
    .to(`parking_lot_${heldSpot.parkingLot}`)
    .emit("spot_update", {
      spotId: heldSpot._id,
      status: "occupied",
    });

  global.io.to(`user_${req.user._id}`).emit("booking_update", booking);

  res.status(201).json(booking);
};


const getBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("parkingLot parkingSpot vehicle")
    .sort({ createdAt: -1 });

  res.json(bookings);
};


const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(
    "parkingLot parkingSpot vehicle"
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.json(booking);
};


const checkInBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (booking.status !== "confirmed") {
    return res.status(400).json({ message: "Invalid booking state" });
  }

  booking.status = "active";
  booking.checkedInAt = new Date();
  await booking.save();

  res.json(booking);
};


const checkOutBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (booking.status !== "active") {
    return res.status(400).json({ message: "Booking not active" });
  }

  const now = new Date();
  booking.checkedOutAt = now;
  booking.actualEndTime = now;

  // 🔹 Calculate overtime
  let extraAmount = 0;

  if (now > booking.endTime) {
    const parkingLot = await ParkingLot.findById(booking.parkingLot);

    const overtimeMs = now - booking.endTime;
    const overtimeMinutes = Math.ceil(overtimeMs / (1000 * 60));

    const ratePerMinute = parkingLot.baseRate / 60;
    extraAmount = overtimeMinutes * ratePerMinute;

    booking.extraAmountPaid = extraAmount;

    // 🔔 wallet deduction will go here later
  }

  booking.status = "completed";
  await booking.save();

  // free the spot
  const spot = await ParkingSpot.findById(booking.parkingSpot);
  spot.status = "available";
  await spot.save();

  global.io
    .to(`parking_lot_${booking.parkingLot}`)
    .emit("spot_update", {
      spotId: spot._id,
      status: "available",
    });

  res.json({
    message: "Checked out successfully",
    extraAmountPaid: extraAmount,
    booking,
  });
};


const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (["completed", "cancelled"].includes(booking.status)) {
    return res.status(400).json({ message: "Cannot cancel booking" });
  }

  booking.status = "cancelled";
  await booking.save();

  // free spot
  const spot = await ParkingSpot.findById(booking.parkingSpot);
  if (spot) {
    spot.status = "available";
    await spot.save();

    global.io
      .to(`parking_lot_${booking.parkingLot}`)
      .emit("spot_update", {
        spotId: spot._id,
        status: "available",
      });
  }

  res.json({ message: "Booking cancelled" });
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
};
