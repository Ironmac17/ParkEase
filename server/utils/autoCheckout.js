const Booking = require("../models/Booking");
const ParkingSpot = require("../models/ParkingSpot");
const ParkingLot = require("../models/ParkingLot");
const { debitWallet } = require("./walletUtils");
const { sendEmail } = require("./emailService");
const { calculateAmount } = require("./pricingUtils");
const { checkoutSummary } = require("./emailTemplates");

const autoCheckoutBookings = async () => {
  const now = new Date();

  // 1️⃣ Find overdue ACTIVE bookings + populate user
  const overdueBookings = await Booking.find({
    status: "active",
    endTime: { $lt: now },
  }).populate("user");

  for (const booking of overdueBookings) {
    try {
      const parkingLot = await ParkingLot.findById(booking.parkingLot);
      if (!parkingLot) continue;

      const extraAmount = await calculateAmount({
        parkingLot,
        fromTime: booking.endTime,
        toTime: now,
      });

      // 3️⃣ Update booking
      booking.status = "completed";
      booking.checkedOutAt = now;
      booking.actualEndTime = now;
      booking.extraAmountPaid = extraAmount;
      await booking.save();

      // 4️⃣ Debit wallet (if needed)
      if (extraAmount > 0) {
        try {
          await debitWallet({
            userId: booking.user._id,
            amount: extraAmount,
            reason: "Auto-checkout overtime charge",
            bookingId: booking._id,
          });
        } catch (err) {
          // wallet failure should NOT stop auto-checkout
          console.error("Wallet debit failed:", err.message);
        }
      }

      // 5️⃣ Free parking spot
      const spot = await ParkingSpot.findById(booking.parkingSpot);
      if (spot) {
        spot.status = "available";
        spot.heldBy = null;
        spot.holdExpiresAt = null;
        await spot.save();

        global.io
          .to(`parking_lot_${booking.parkingLot}`)
          .emit("spot_update", {
            spotId: spot._id,
            status: "available",
          });
      }

      // 6️⃣ Send email (non-blocking)
      sendEmail({
        to: booking.user.email,
        subject: "ParkEase Auto Checkout",
        html: checkoutSummary({
          total: booking.amountPaid + (booking.extraAmountPaid || 0),
          extra: booking.extraAmountPaid || 0,
        }),
      });
    } catch (err) {
      console.error("Auto-checkout failed for booking:", booking._id);
    }
  }
};

module.exports = autoCheckoutBookings;