const express = require("express");
const router = express.Router();

const {
  getFestivals,
  createFestival,
  deleteFestival,
} = require("../controllers/festivalController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public (used by pricing engine optionally)
router.get("/", getFestivals);

// Admin only
router.post("/", protect, authorize("admin"), createFestival);
router.delete("/:id", protect, authorize("admin"), deleteFestival);

module.exports = router;
