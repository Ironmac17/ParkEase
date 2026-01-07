const express = require("express");
const router = express.Router();

const {
  getOwnerStats,
  getOwnerRevenue,
  getOwnerLotAnalytics,
} = require("../controllers/ownerController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
router.use(protect, authorize("owner", "admin"));

router.get("/stats", getOwnerStats);
router.get("/revenue", getOwnerRevenue);
router.get("/lots", getOwnerLotAnalytics);

module.exports = router;
