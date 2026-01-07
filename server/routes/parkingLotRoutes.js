const express = require("express");
const router = express.Router();

const {
  createParkingLot,
  getParkingLots,
  getParkingLotById,
  getOwnerParkingLots,
  updateParkingLot,
} = require("../controllers/parkingLotController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public
router.get("/", getParkingLots);


// Owner
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  createParkingLot
);

router.get(
  "/owner/my-lots",
  protect,
  authorize("owner", "admin"),
  getOwnerParkingLots
);

router.patch(
  "/:id",
  protect,
  authorize("owner", "admin"),
  updateParkingLot
);

router.get("/:id", getParkingLotById);

module.exports = router;
