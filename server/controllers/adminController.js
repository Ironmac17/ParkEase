const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Booking = require("../models/Booking");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};


const updateUserStatus = async (req, res) => {
  const { status } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.status = status; // active | banned | pending
  await user.save();

  res.json({ message: "User status updated", user });
};


const getAllParkingLots = async (req, res) => {
  const lots = await ParkingLot.find().populate("owner", "email username");
  res.json(lots);
};



const getPlatformAnalytics = async (req, res) => {
  const now = new Date();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 7);

  const monthStart = new Date();
  monthStart.setDate(now.getDate() - 30);

  const getRevenue = async (from) => {
    const bookings = await Booking.find({
      status: "completed",
      checkedOutAt: { $gte: from },
    });

    return bookings.reduce(
      (sum, b) => sum + b.amountPaid + (b.extraAmountPaid || 0),
      0
    );
  };

  res.json({
    totalRevenue: await getRevenue(new Date(0)),
    todayRevenue: await getRevenue(todayStart),
    last7DaysRevenue: await getRevenue(weekStart),
    last30DaysRevenue: await getRevenue(monthStart),
  });
};


const getTopParkingLots = async (req, res) => {
  const bookings = await Booking.find({ status: "completed" }).populate(
    "parkingLot"
  );

  const revenueMap = {};

  bookings.forEach((b) => {
    const lotId = b.parkingLot._id.toString();
    const amount = b.amountPaid + (b.extraAmountPaid || 0);

    if (!revenueMap[lotId]) {
      revenueMap[lotId] = {
        parkingLot: b.parkingLot.name,
        revenue: 0,
      };
    }
    revenueMap[lotId].revenue += amount;
  });

  const sorted = Object.values(revenueMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  res.json(sorted);
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllParkingLots,
  getPlatformAnalytics,
  getTopParkingLots,
};
