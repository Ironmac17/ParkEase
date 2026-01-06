const express = require("express");
const router = express.Router();

const {
  addSpot,
  batchCreateSpots,
  deleteSpot,
  toggleSpotStatus,
} = require("../controllers/parkingSpotController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// create spots
router.post("/:id/spots", protect, authorize("owner", "admin"), addSpot);
router.post(
  "/:id/spots/batch",
  protect,
  authorize("owner", "admin"),
  batchCreateSpots
);

// delete spot
router.delete(
  "/spots/:spotId",
  protect,
  authorize("owner", "admin"),
  deleteSpot
);

// close / open spot
router.patch(
  "/spots/:spotId/status",
  protect,
  authorize("owner", "admin"),
  toggleSpotStatus
);

module.exports = router;
