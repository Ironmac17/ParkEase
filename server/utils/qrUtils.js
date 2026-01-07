const QRCode = require("qrcode");

const generateBookingQR = async ({ bookingId, userId, spotId, validTill }) => {
  const payload = JSON.stringify({
    bookingId,
    userId,
    spotId,
    validTill,
  });

  return QRCode.toDataURL(payload);
};

module.exports = { generateBookingQR };
