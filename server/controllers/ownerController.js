const Booking = require("../models/Booking")
const ParkingLot = require("../models/ParkingLot");
const ParkingSpot = require("../models/ParkingSpot");

const getOwnerDashboard = async (req, res) => {
  const ownerId = req.user._id;

  // Fetch owner lots
  const parkingLots = await ParkingLot.find({ owner: ownerId });
  const lotIds = parkingLots.map((lot) => lot._id);

  // Spot stats
  const totalSpots = await ParkingSpot.countDocuments({
    parkingLot: { $in: lotIds },
  });

  const occupiedSpots = await ParkingSpot.countDocuments({
    parkingLot: { $in: lotIds },
    status: "occupied",
  });

  // Today's bookings for revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayBookings = await Booking.find({
    parkingLot: { $in: lotIds },
    status: "completed",
    checkedOutAt: { $gte: todayStart },
  });

  const todayRevenue = todayBookings.reduce((sum, b) => {
    const baseAmount = Number(b.amountPaid) || 0;
    const extraAmount = Number(b.extraAmountPaid) || 0;
    return sum + baseAmount + extraAmount;
  }, 0);

  // Active bookings (confirmed or active status)
  const activeBookings = await Booking.find({
    parkingLot: { $in: lotIds },
    status: { $in: ["confirmed", "active"] },
  }).populate("parkingLot parkingSpot vehicle user");

  res.json({
    totalLots: parkingLots.length,
    totalSpots,
    occupiedSpots,
    todayRevenue,
    activeBookings,
    parkingLots,
  });
};

const getOwnerStats = async (req, res) => {
  const ownerId = req.user._id;

  // 1️⃣ Fetch owner lots
  const parkingLots = await ParkingLot.find({ owner: ownerId });
  const lotIds = parkingLots.map((lot) => lot._id);

  // 2️⃣ Spot stats
  const totalSpots = await ParkingSpot.countDocuments({
    parkingLot: { $in: lotIds },
  });

  const activeSpots = await ParkingSpot.countDocuments({
    parkingLot: { $in: lotIds },
    status: { $in: ["available", "held"] },
  });

  // 3️⃣ Booking stats
  const bookings = await Booking.find({
    parkingLot: { $in: lotIds },
    status: "completed",
  });

  const totalRevenue = bookings.reduce((sum, b) => {
    const baseAmount = Number(b.amountPaid) || 0;
    const extraAmount = Number(b.extraAmountPaid) || 0;
    return sum + baseAmount + extraAmount;
  }, 0);

  res.json({
    totalParkingLots: parkingLots.length,
    totalSpots,
    activeSpots,
    totalBookings: bookings.length,
    totalRevenue,
  });
};

const getOwnerBookings = async (req, res) => {
  const ownerId = req.user._id;
  const { lotId, status, from, to } = req.query;

  // Get owner's parking lots
  const parkingLots = await ParkingLot.find({ owner: ownerId });
  const lotIds = parkingLots.map((lot) => lot._id);

  let filter = { parkingLot: { $in: lotIds } };

  if (lotId) {
    filter.parkingLot = lotId;
  }

  if (status) {
    filter.status = status;
  }

  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = new Date(from);
    if (to) filter.startTime.$lte = new Date(to);
  }

  const bookings = await Booking.find(filter)
    .populate("parkingLot", "name")
    .populate("parkingSpot", "label")
    .populate("user", "email username")
    .populate("vehicle")
    .sort({ createdAt: -1 });

  res.json({ bookings });
};



const getOwnerRevenue = async (req, res) => {
  const ownerId = req.user._id;
  const now = new Date();

  const parkingLots = await ParkingLot.find({ owner: ownerId });
  const lotIds = parkingLots.map((lot) => lot._id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 7);

  const monthStart = new Date();
  monthStart.setDate(now.getDate() - 30);

  const getRevenue = async (from) => {
    const bookings = await Booking.find({
      parkingLot: { $in: lotIds },
      status: "completed",
      checkedOutAt: { $gte: from },
    });

    return bookings.reduce(
      (sum, b) => sum + b.amountPaid + (b.extraAmountPaid || 0),
      0
    );
  };

  res.json({
    today: await getRevenue(todayStart),
    last7Days: await getRevenue(weekStart),
    last30Days: await getRevenue(monthStart),
  });
};

const getRevenueAnalytics = async (req, res) => {
  const ownerId = req.user._id;
  const { lotId, from, to } = req.query;

  // Build filter
  let filter = { owner: ownerId };
  if (lotId) {
    filter._id = lotId;
  }

  const lot = await ParkingLot.findOne(filter);
  if (!lot) {
    return res.status(404).json({ message: "Parking lot not found" });
  }

  // Get bookings for this lot
  let bookingFilter = {
    parkingLot: lot._id,
    status: "completed",
  };

  if (from || to) {
    bookingFilter.checkedOutAt = {};
    if (from) bookingFilter.checkedOutAt.$gte = new Date(from);
    if (to) bookingFilter.checkedOutAt.$lte = new Date(to);
  }

  const bookings = await Booking.find(bookingFilter).populate("user", "username email");

  // Ensure proper number conversion
  const totalRevenue = bookings.reduce((sum, b) => {
    const basAmount = Number(b.amountPaid) || 0;
    const extraAmount = Number(b.extraAmountPaid) || 0;
    return sum + basAmount + extraAmount;
  }, 0);

  const overtimeRevenue = bookings.reduce(
    (sum, b) => sum + (Number(b.extraAmountPaid) || 0),
    0
  );

  console.log(`[Revenue Analytics] Lot: ${lot._id}, Bookings: ${bookings.length}, Total Revenue: ${totalRevenue}`);

  res.json({
    totalRevenue,
    overtimeRevenue,
    totalBookings: bookings.length,
    averagePerBooking: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    bookings,
  });
};


const getOwnerLotAnalytics = async (req, res) => {
  const ownerId = req.user._id;

  const lots = await ParkingLot.find({ owner: ownerId });

  const data = [];

  for (const lot of lots) {
    const spots = await ParkingSpot.find({ parkingLot: lot._id });

    const bookings = await Booking.find({
      parkingLot: lot._id,
      status: "completed",
    });

    const revenue = bookings.reduce(
      (sum, b) => sum + b.amountPaid + (b.extraAmountPaid || 0),
      0
    );

    data.push({
      _id: lot._id,
      parkingLotId: lot._id,
      name: lot.name,
      address: lot.address,
      totalSpots: spots.length,
      availableSpots: spots.filter((s) => s.status === "available").length,
      occupiedSpots: spots.filter((s) => s.status === "occupied").length,
      totalBookings: bookings.length,
      revenue,
      owner: lot.owner,
      baseRate: lot.baseRate,
    });
  }

  // Return wrapped in { lots } for consistency with client expectations
  res.json({ lots: data });
};

module.exports = {
  getOwnerDashboard,
  getOwnerStats,
  getOwnerRevenue,
  getRevenueAnalytics,
  getOwnerBookings,
  getOwnerLotAnalytics,
};
