const express = require("express");
const router = express.Router();

const {
  getVehicles,
  addVehicle,
  deleteVehicle,
  setDefaultVehicle,
} = require("../controllers/vehicleController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getVehicles);
router.post("/", addVehicle);
router.delete("/:id", deleteVehicle);
router.patch("/:id/default", setDefaultVehicle);

module.exports = router;
