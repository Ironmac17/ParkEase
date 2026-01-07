const ParkingLot = require("../models/ParkingLot");
const Booking = require("../models/Booking");

const getOwnerStats = async (req, res) => {
  const lots = await ParkingLot.find({ owner: req.user._id });

  const lotIds = lots.map((l) => l._id);

  const bookings = await Booking.find({
    parkingLot: { $in: lotIds },
    status: "completed",
  });

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + b.amountPaid + (b.extraAmountPaid || 0),
    0
  );

  res.json({
    totalBookings: bookings.length,
    totalRevenue,
  });
};

module.exports = {
  getOwnerStats,
};
