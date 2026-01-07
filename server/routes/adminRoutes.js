const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserStatus,
  getAllParkingLots,
  getPlatformAnalytics,
  getTopParkingLots,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// 🔐 All admin routes
router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);

router.get("/parking-lots", getAllParkingLots);

router.get("/analytics", getPlatformAnalytics);
router.get("/analytics/top-lots", getTopParkingLots);

module.exports = router;
