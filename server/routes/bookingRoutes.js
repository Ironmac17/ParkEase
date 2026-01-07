const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  extendBooking
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

// all booking routes require login
router.use(protect);

// create booking
router.post("/", createBooking);
// get all user bookings
router.get("/", getBookings);
// get single booking
router.get("/:id", getBookingById);
// check-in
router.post("/:id/check-in", checkInBooking);
// check-out
router.post("/:id/check-out", checkOutBooking);
// cancel booking
router.post("/:id/cancel", cancelBooking);
//extend booking
router.post("/:id/extend", extendBooking);

module.exports = router;
