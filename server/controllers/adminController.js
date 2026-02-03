const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Booking = require("../models/Booking");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
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

const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.status = "banned";
  await user.save();

  // 📢 Broadcast user block event
  global.io.emit("user:blocked", { userId: user._id, email: user.email });

  res.json({ message: "User blocked", user });
};

const unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.status = "active";
  await user.save();

  // 📢 Broadcast user unblock event
  global.io.emit("user:unblocked", { userId: user._id, email: user.email });

  res.json({ message: "User unblocked", user });
};


const getAllParkingLots = async (req, res) => {
  const lots = await ParkingLot.find().populate("owner", "email username");

  // shape to match client expectation
  const parkings = lots.map((lot) => ({
    ...lot._doc,
    status: lot.isActive ? "ACTIVE" : "SUSPENDED",
  }));

  res.json({ parkings });
};

const getDashboard = async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalOwners = await User.countDocuments({ role: "owner" });
  const totalParkings = await ParkingLot.countDocuments();

  // revenue calculation (total ever)
  const bookings = await Booking.find({ status: "completed" });
  const totalRevenue = bookings.reduce((sum, b) => {
    const baseAmount = Number(b.amountPaid) || 0;
    const extraAmount = Number(b.extraAmountPaid) || 0;
    return sum + baseAmount + extraAmount;
  }, 0);

  res.json({ totalUsers, totalOwners, totalParkings, totalRevenue });
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

    return bookings.reduce((sum, b) => {
      const baseAmount = Number(b.amountPaid) || 0;
      const extraAmount = Number(b.extraAmountPaid) || 0;
      return sum + baseAmount + extraAmount;
    }, 0);
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

const approveParking = async (req, res) => {
  const lot = await ParkingLot.findById(req.params.id);
  if (!lot) return res.status(404).json({ message: "Parking lot not found" });
  lot.isActive = true;
  await lot.save();

  // 📢 Broadcast parking approval event
  global.io.emit("parking:approved", { parkingLotId: lot._id, name: lot.name });

  res.json({ message: "Parking approved", lot });
};

const suspendParking = async (req, res) => {
  const lot = await ParkingLot.findById(req.params.id);
  if (!lot) return res.status(404).json({ message: "Parking lot not found" });
  lot.isActive = false;
  await lot.save();

  // 📢 Broadcast parking suspension event
  global.io.emit("parking:suspended", { parkingLotId: lot._id, name: lot.name });

  res.json({ message: "Parking suspended", lot });
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllParkingLots,
  getPlatformAnalytics,
  getTopParkingLots,
  approveParking,
  suspendParking,
  blockUser,
  unblockUser,
  getDashboard,
};
