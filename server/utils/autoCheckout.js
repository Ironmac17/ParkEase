const Booking = require("../models/Booking");
const ParkingSpot = require("../models/ParkingSpot");
const ParkingLot = require("../models/ParkingLot");
const { debitWallet } = require("./walletUtils");

const autoCheckoutBookings = async () => {
  const now = new Date();

  // 1️⃣ Find overdue ACTIVE bookings
  const overdueBookings = await Booking.find({
    status: "active",
    endTime: { $lt: now },
  });

  for (const booking of overdueBookings) {
    try {
      const parkingLot = await ParkingLot.findById(booking.parkingLot);
      if (!parkingLot) continue;

      // 2️⃣ Calculate overtime
      const overtimeMs = now - booking.endTime;
      const overtimeMinutes = Math.ceil(overtimeMs / (1000 * 60));
      const ratePerMinute = parkingLot.baseRate / 60;
      const extraAmount = overtimeMinutes * ratePerMinute;

      // 3️⃣ Update booking
      booking.status = "completed";
      booking.checkedOutAt = now;
      booking.actualEndTime = now;
      booking.extraAmountPaid = extraAmount;

      await booking.save();
      if (extraAmount > 0) {
        try {
          await debitWallet({
            userId: booking.user,
            amount: extraAmount,
            reason: "Auto-checkout overtime charge",
            bookingId: booking._id,
          });
        } catch (err) {
          // negative balance handling can be added later
        }
      }

      // 5️⃣ Free parking spot
      const spot = await ParkingSpot.findById(booking.parkingSpot);
      if (spot) {
        spot.status = "available";
        spot.heldBy = null;
        spot.holdExpiresAt = null;
        await spot.save();

        // 🔔 socket update
        global.io
          .to(`parking_lot_${booking.parkingLot}`)
          .emit("spot_update", {
            spotId: spot._id,
            status: "available",
          });
      }
    } catch (err) {
      console.error("Auto-checkout failed for booking:", booking._id);
    }
  }
};

module.exports = autoCheckoutBookings;
