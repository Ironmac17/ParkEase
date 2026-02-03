const express = require("express");
const router = express.Router();

const {
  getOwnerDashboard,
  getOwnerStats,
  getOwnerRevenue,
  getRevenueAnalytics,
  getOwnerBookings,
  getOwnerLotAnalytics,
} = require("../controllers/ownerController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
router.use(protect, authorize("owner", "admin"));

router.get("/dashboard", getOwnerDashboard);
router.get("/stats", getOwnerStats);
router.get("/revenue", getOwnerRevenue);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/bookings", getOwnerBookings);
router.get("/lots", getOwnerLotAnalytics);

module.exports = router;
