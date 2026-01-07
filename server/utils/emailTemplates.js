const bookingConfirmation = ({ name, lot, spot, start, end, amount }) => `
  <h2>Booking Confirmed 🚗</h2>
  <p>Hi ${name},</p>
  <p>Your parking booking is confirmed.</p>
  <ul>
    <li><b>Parking Lot:</b> ${lot}</li>
    <li><b>Spot:</b> ${spot}</li>
    <li><b>Start:</b> ${start}</li>
    <li><b>End:</b> ${end}</li>
    <li><b>Amount Paid:</b> ₹${amount}</li>
  </ul>
  <p>Thank you for using ParkEase.</p>
`;

const extensionConfirmation = ({ newEnd, extra }) => `
  <h2>Booking Extended ⏱️</h2>
  <p>Your booking has been extended.</p>
  <p><b>New End Time:</b> ${newEnd}</p>
  <p><b>Extra Amount Charged:</b> ₹${extra}</p>
`;

const checkoutSummary = ({ total, extra }) => `
  <h2>Checkout Complete ✅</h2>
  <p>Your parking session is completed.</p>
  <p><b>Total Paid:</b> ₹${total}</p>
  <p><b>Overtime Charges:</b> ₹${extra}</p>
`;

const cancellationEmail = ({ amount }) => `
  <h2>Booking Cancelled ❌</h2>
  <p>Your booking has been cancelled.</p>
  <p><b>Refunded Amount:</b> ₹${amount}</p>
`;

module.exports = {
  bookingConfirmation,
  extensionConfirmation,
  checkoutSummary,
  cancellationEmail,
};
