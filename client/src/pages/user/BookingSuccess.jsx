import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  MapPin,
  Clock,
  Car,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function BookingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await axios.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const downloadReceipt = () => {
    const qrElement = document.getElementById("booking-qr");
    const canvas = qrElement.querySelector("canvas");
    const qrImage = canvas.toDataURL("image/png");

    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ParkEase Receipt - ${booking._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 15px; }
          .logo { font-size: 28px; font-weight: bold; color: #007bff; }
          .status { font-size: 12px; color: #666; margin-top: 5px; }
          .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .qr-section img { max-width: 200px; }
          .qr-label { font-size: 12px; color: #666; margin-top: 10px; }
          .details { margin: 25px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-label { color: #666; font-weight: 500; }
          .detail-value { font-weight: 600; color: #333; }
          .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #007bff; font-size: 14px; }
          .summary { background: #f0f8ff; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #007bff; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ParkEase</div>
            <div class="status">Booking Receipt</div>
          </div>

          <div class="qr-section">
            <img src="${qrImage}" alt="Booking QR Code" />
            <div class="qr-label">Show this QR code at parking entry</div>
          </div>

          <div class="details">
            <div class="section-title">PARKING LOCATION</div>
            <div class="detail-row">
              <span class="detail-label">Parking Lot:</span>
              <span class="detail-value">${booking.parkingLot.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Spot:</span>
              <span class="detail-value">${booking.parkingSpot.label}</span>
            </div>

            <div class="section-title">BOOKING DETAILS</div>
            <div class="detail-row">
              <span class="detail-label">Check-In:</span>
              <span class="detail-value">${new Date(booking.startTime).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-Out:</span>
              <span class="detail-value">${new Date(booking.endTime).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${calculateDuration(booking.startTime, booking.endTime)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Vehicle:</span>
              <span class="detail-value">${booking.vehicle.registrationNumber}</span>
            </div>

            <div class="section-title">PRICING BREAKDOWN</div>
            <div class="summary">
              <div class="summary-row">
                <span>Parking Charges:</span>
                <span>₹${booking.amountPaid.toFixed(2)}</span>
              </div>
              ${
                booking.extraAmountPaid > 0
                  ? `
              <div class="summary-row">
                <span>Overtime Charges:</span>
                <span>₹${booking.extraAmountPaid.toFixed(2)}</span>
              </div>
              `
                  : ""
              }
              <div class="summary-row total-row">
                <span>Total Amount:</span>
                <span>₹${(booking.amountPaid + (booking.extraAmountPaid || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Booking ID: ${booking._id}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Thank you for using ParkEase!</p>
          </div>
        </div>
      </body>
      </html>
    `);
    receiptWindow.document.close();
    setTimeout(() => receiptWindow.print(), 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Booking not found</p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const duration = calculateDuration(booking.startTime, booking.endTime);
  const totalAmount = booking.amountPaid + (booking.extraAmountPaid || 0);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-bookings")}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to My Bookings
          </button>
          <h1 className="text-4xl font-bold">Booking Confirmed ✓</h1>
          <p className="text-gray-400 mt-2">Your parking space is reserved</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Status */}
            <div className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                  ✓
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-300">
                    Booking Success!
                  </h2>
                  <p className="text-gray-300">Booking ID: {booking._id}</p>
                </div>
              </div>
            </div>

            {/* Parking Location */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">Parking Location</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Parking Lot</p>
                  <p className="text-lg font-semibold">
                    {booking.parkingLot?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Address</p>
                  <p className="text-gray-300">{booking.parkingLot?.address}</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-gray-400 text-sm mb-1">Spot Number</p>
                  <p className="text-2xl font-bold text-purple-300">
                    {booking.parkingSpot?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Check-In</p>
                    <p className="font-semibold">
                      {new Date(booking.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Check-Out</p>
                    <p className="font-semibold">
                      {new Date(booking.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
                  <p className="text-gray-400 text-sm mb-1">Duration</p>
                  <p className="text-2xl font-bold text-orange-300">
                    {duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">Vehicle</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Registration</p>
                    <p className="font-semibold">
                      {booking.vehicle?.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Model</p>
                    <p className="font-semibold">{booking.vehicle?.model}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - QR and Amount */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <h3 className="font-semibold mb-4">Show at Entry</h3>
              <div
                id="booking-qr"
                className="flex justify-center mb-4 bg-white p-4 rounded-lg"
              >
                <QRCodeCanvas value={booking._id} size={200} />
              </div>
              <p className="text-sm text-gray-400">
                Scan this QR at parking entry
              </p>
            </div>

            {/* Amount */}
            <div className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Amount Paid</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Parking Charge</span>
                  <span className="font-semibold">
                    ₹{booking.amountPaid?.toFixed(2)}
                  </span>
                </div>
                {booking.extraAmountPaid > 0 && (
                  <div className="flex justify-between text-orange-300">
                    <span>Overtime Charge</span>
                    <span className="font-semibold">
                      ₹{booking.extraAmountPaid?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-3xl font-bold text-green-300">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Receipt */}
            <button
              onClick={downloadReceipt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download size={20} />
              Download Receipt
            </button>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex-1 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white py-3 rounded-xl font-semibold transition"
              >
                My Bookings
              </button>
              <button
                onClick={() => navigate("/discover")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Book Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
