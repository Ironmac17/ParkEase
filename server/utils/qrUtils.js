const QRCode = require("qrcode");

const generateBookingQR = async (bookingData) => {
  // Create comprehensive QR payload with all booking details
  const payload = JSON.stringify({
    bookingId: bookingData.bookingId,
    userId: bookingData.userId,
    spotId: bookingData.spotId,
    lotId: bookingData.lotId,
    lotName: bookingData.lotName,
    spotLabel: bookingData.spotLabel,
    vehicleRegistration: bookingData.vehicleRegistration,
    vehicleModel: bookingData.vehicleModel,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    amountPaid: bookingData.amountPaid,
    userName: bookingData.userName,
    userPhone: bookingData.userPhone,
    timestamp: new Date().toISOString(),
  });

  return QRCode.toDataURL(payload);
};

module.exports = { generateBookingQR };
