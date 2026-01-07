const Booking = require("../models/Booking");
const ParkingSpot = require("../models/ParkingSpot");
const ParkingLot = require("../models/ParkingLot");
const { debitWallet } = require("./walletUtils");

const autoCheckoutBookings = async () => {
  const now = new Date();

  const overdueBookings = await Booking.find({
    status: "active",
    endTime: { $lt: now },
  });

  for (const booking of overdueBookings) {
    const parkingLot = await ParkingLot.findById(booking.parkingLot);

    const overtimeMs = now - booking.endTime;
    const overtimeMinutes = Math.ceil(overtimeMs / (1000 * 60));
    const ratePerMinute = parkingLot.baseRate / 60;
    const extraAmount = overtimeMinutes * ratePerMinute;

    booking.status = "completed";
    booking.checkedOutAt = now;
    booking.actualEndTime = now;
    booking.extraAmountPaid = extraAmount;

    await booking.save();

    // debit wallet
    if (extraAmount > 0) {
      try {
        await debitWallet({
          userId: booking.user,
          amount: extraAmount,
          reason: "Auto-checkout overtime charge",
          bookingId: booking._id,
        });
      } catch (err) {
        // wallet insufficient → still checkout, balance may go negative later logic
      }
    }

    // free spot
    const spot = await ParkingSpot.findById(booking.parkingSpot);
    if (spot) {
      spot.status = "available";
      await spot.save();

      global.io
        .to(`parking_lot_${booking.parkingLot}`)
        .emit("spot_update", {
          spotId: spot._id,
          status: "available",
        });
    }
  }
};

module.exports = autoCheckoutBookings;
