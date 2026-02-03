const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserStatus,
  getAllParkingLots,
  getPlatformAnalytics,
  getTopParkingLots,
  blockUser,
  unblockUser,
  getDashboard,
  approveParking,
  suspendParking,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// 🔐 All admin routes
router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);

// convenience endpoints expected by client
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);

router.get("/parkings", getAllParkingLots);
router.get("/dashboard", getDashboard);
router.patch("/parkings/:id/approve", approveParking);
router.patch("/parkings/:id/suspend", suspendParking);

router.get("/parking-lots", getAllParkingLots);

router.get("/analytics", getPlatformAnalytics);
router.get("/analytics/top-lots", getTopParkingLots);

module.exports = router;
