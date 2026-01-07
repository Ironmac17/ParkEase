const express = require("express");
const router = express.Router();

const { getOwnerStats } = require("../controllers/ownerController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Owner analytics
router.get(
  "/stats",
  protect,
  authorize("owner", "admin"),
  getOwnerStats
);

module.exports = router;
