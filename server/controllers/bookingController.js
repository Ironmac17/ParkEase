const Booking = require("../models/Booking");
const ParkingSpot = require("../models/ParkingSpot");
const Vehicle = require("../models/Vehicle");
const ParkingLot = require("../models/ParkingLot");
const { calculateAmount } = require("../utils/pricingUtils");
const { holdSpot, releaseSpot } = require("../utils/slotLock");
const { debitWallet, creditWallet } = require("../utils/walletUtils");
const { sendEmail } = require("../utils/emailService");
const {
  bookingConfirmation,
  extensionConfirmation,
  checkoutSummary,
  cancellationEmail,
} = require("../utils/emailTemplates");
const { generateBookingQR } = require("../utils/qrUtils");


const createBooking = async (req, res) => {
  const { spotId, vehicleId, startTime, endTime } = req.body;

  // 1️⃣ Basic validations
  if (!spotId || !vehicleId || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start < now) {
    return res.status(400).json({ message: "Start time cannot be in the past" });
  }

  if (end <= start) {
    return res.status(400).json({
      message: "End time must be after start time",
    });
  }

  // 2️⃣ Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Invalid vehicle" });
  }

  // 3️⃣ Atomically hold parking spot
  const heldSpot = await holdSpot(spotId, req.user._id);
  if (!heldSpot) {
    return res.status(409).json({ message: "Spot unavailable" });
  }

  // Safety: release spot if closed
  if (heldSpot.status === "closed") {
    await releaseSpot(spotId, req.user._id);
    return res.status(400).json({ message: "Spot is closed" });
  }

  // 4️⃣ Calculate booking amount using dynamic pricing
  const parkingLot = await ParkingLot.findById(heldSpot.parkingLot);

  // 4a️⃣ Check for overlapping bookings on this spot
  const overlapping = await Booking.findOne({
    parkingSpot: heldSpot._id,
    status: { $in: ["confirmed", "active"] },
    startTime: { $lt: end },
    endTime: { $gt: start },
  });

  if (overlapping) {
    await releaseSpot(spotId, req.user._id);
    return res
      .status(409)
      .json({ code: "CONFLICT", message: "Spot reserved for selected time" });
  }

  const bookingAmount = await calculateAmount({
    parkingLot,
    fromTime: start,
    toTime: end,
  });

  if (bookingAmount <= 0) {
    await releaseSpot(spotId, req.user._id);
    return res.status(400).json({ message: "Invalid booking amount" });
  }

  // 5️⃣ Debit wallet BEFORE creating booking
  try {
    await debitWallet({
      userId: req.user._id,
      amount: bookingAmount,
      reason: "Parking booking payment",
    });
  } catch (err) {
    await releaseSpot(spotId, req.user._id);
    return res.status(400).json({ message: err.message });
  }

  // 6️⃣ Create booking
  const booking = await Booking.create({
    user: req.user._id,
    parkingLot: heldSpot.parkingLot,
    parkingSpot: heldSpot._id,
    vehicle: vehicleId,
    startTime: start,
    endTime: end,
    amountPaid: bookingAmount,
    paymentMethod: "wallet",
    status: "confirmed",
  });

  // 7️⃣ Generate QR code for booking with all data
  const qrCode = await generateBookingQR({
    bookingId: booking._id,
    userId: booking.user,
    spotId: booking.parkingSpot._id,
    lotId: parkingLot._id,
    lotName: parkingLot.name,
    spotLabel: heldSpot.label,
    vehicleRegistration: vehicle.registrationNumber,
    vehicleModel: vehicle.model,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    amountPaid: bookingAmount,
    userName: req.user.username,
    userPhone: req.user.phone,
  });

  booking.qrCode = qrCode;
  await booking.save();

  // 8️⃣ Send confirmation email (non-blocking)
  sendEmail({
    to: req.user.email,
    subject: "ParkEase Booking Confirmed",
    html: bookingConfirmation({
      name: req.user.username,
      lot: parkingLot.name,
      spot: heldSpot.label,
      start,
      end,
      amount: bookingAmount,
    }),
  });

  // 9️⃣ Mark spot as occupied
  heldSpot.status = "occupied";
  heldSpot.heldBy = null;
  heldSpot.holdExpiresAt = null;
  await heldSpot.save();

  // 🔔 Real-time update
  global.io.to(`parking_lot_${heldSpot.parkingLot}`).emit("spot_update", {
    spotId: heldSpot._id,
    status: "occupied",
  });

  // 🔟 Final response
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
  const booking = await Booking.findById(req.params.id).populate("user");

  if (!booking || booking.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (booking.status !== "active") {
    return res.status(400).json({ message: "Booking not active" });
  }

  const parkingLot = await ParkingLot.findById(booking.parkingLot);

  const now = new Date();
  booking.checkedOutAt = now;
  booking.actualEndTime = now;

  let extraAmount = 0;

  if (now > booking.endTime) {
    extraAmount = await calculateAmount({
      parkingLot,
      fromTime: booking.endTime,
      toTime: now,
    });

    booking.extraAmountPaid = extraAmount;

    await debitWallet({
      userId: booking.user._id,
      amount: extraAmount,
      reason: "Overtime parking charge",
      bookingId: booking._id,
    });
  }

  booking.status = "completed";
  await booking.save();

  const spot = await ParkingSpot.findById(booking.parkingSpot);
  spot.status = "available";
  await spot.save();

  sendEmail({
    to: booking.user.email,
    subject: "ParkEase Checkout Summary",
    html: checkoutSummary({
      total: booking.amountPaid + extraAmount,
      extra: extraAmount,
    }),
  });

  res.json({
    message: "Checked out successfully",
    extraAmountPaid: extraAmount,
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

  // refund wallet
  await creditWallet({
    userId: booking.user,
    amount: booking.amountPaid,
    reason: "Booking refund",
    bookingId: booking._id,
  });

  sendEmail({
    to: req.user.email,
    subject: "ParkEase Booking Cancelled",
    html: cancellationEmail({
      amount: booking.amountPaid,
    }),
  });

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

  res.json({ message: "Booking cancelled and refunded" });
};

const extendBooking = async (req, res) => {
  const { newEndTime } = req.body;

  if (!newEndTime) {
    return res.status(400).json({ message: "newEndTime is required" });
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (booking.status !== "active") {
    return res.status(400).json({
      message: "Only active bookings can be extended",
    });
  }

  const newEnd = new Date(newEndTime);
  if (newEnd <= booking.endTime) {
    return res.status(400).json({
      message: "New end time must be after current end time",
    });
  }
  const MAX_EXTENSION_HOURS = 12;

  const extensionHours =
    (newEnd - booking.endTime) / (1000 * 60 * 60);

  if (extensionHours > MAX_EXTENSION_HOURS) {
    return res
      .status(400)
      .json({ message: "Extension too long" });
  }

  // Check for overlapping bookings that would conflict with this extension
  const overlap = await Booking.findOne({
    parkingSpot: booking.parkingSpot,
    _id: { $ne: booking._id },
    status: { $in: ["confirmed", "active"] },
    startTime: { $lt: newEnd },
    endTime: { $gt: booking.endTime },
  });

  if (overlap) {
    return res
      .status(409)
      .json({ code: "CONFLICT", message: "Extension overlaps another reservation" });
  }

  // 🔹 Calculate extension cost
  const parkingLot = await ParkingLot.findById(booking.parkingLot);

  const extraAmount = await calculateAmount({
    parkingLot,
    fromTime: booking.endTime,
    toTime: newEnd,
  });

  // 🔐 Debit wallet BEFORE updating booking
  try {
    await debitWallet({
      userId: booking.user,
      amount: extraAmount,
      reason: "Booking extension",
      bookingId: booking._id,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  // 🔄 Update booking
  booking.endTime = newEnd;
  booking.amountPaid += extraAmount;
  await booking.save();

  sendEmail({
    to: req.user.email,
    subject: "ParkEase Booking Extended",
    html: extensionConfirmation({
      newEnd: booking.endTime,
      extra: extraAmount,
    }),
  });


  res.json({
    message: "Booking extended successfully",
    newEndTime: booking.endTime,
    extraAmountPaid: extraAmount,
  });
};


module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  extendBooking
};
