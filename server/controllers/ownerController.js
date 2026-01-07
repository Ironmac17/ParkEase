const Booking = require("../models/Booking")
const ParkingLot = require("../models/ParkingLot");
const ParkingSpot = require("../models/ParkingSpot");



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

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + b.amountPaid + (b.extraAmountPaid || 0),
    0
  );

  res.json({
    totalParkingLots: parkingLots.length,
    totalSpots,
    activeSpots,
    totalBookings: bookings.length,
    totalRevenue,
  });
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
      parkingLotId: lot._id,
      name: lot.name,
      totalSpots: spots.length,
      availableSpots: spots.filter((s) => s.status === "available").length,
      occupiedSpots: spots.filter((s) => s.status === "occupied").length,
      totalBookings: bookings.length,
      revenue,
    });
  }

  res.json(data);
};

module.exports = {
  getOwnerStats,
  getOwnerRevenue,
  getOwnerLotAnalytics,
};
