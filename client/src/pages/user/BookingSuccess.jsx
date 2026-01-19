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
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading booking details…
      </div>
    );
  }

  const duration = calculateDuration(booking.startTime, booking.endTime);
  const totalAmount = booking.amountPaid + (booking.extraAmountPaid || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Card */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">✓</div>
            <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
            <p className="text-gray-300">Your parking spot is reserved</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            Show This QR Code at Entry
          </h2>
          <div id="booking-qr" className="bg-white p-6 rounded-xl inline-block">
            <QRCodeCanvas
              value={JSON.stringify({
                bookingId: booking._id,
                lot: booking.parkingLot.name,
                spot: booking.parkingSpot.label,
                startTime: booking.startTime,
                endTime: booking.endTime,
              })}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-gray-400">Booking ID: {booking._id}</p>
        </div>

        {/* Booking Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-200 mb-4">
              Parking Details
            </h3>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-semibold">{booking.parkingLot.name}</p>
                <p className="text-sm text-gray-300">
                  Spot {booking.parkingSpot.label}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Vehicle</p>
                <p className="font-semibold">
                  {booking.vehicle.registrationNumber}
                </p>
                <p className="text-sm text-gray-300">{booking.vehicle.model}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{duration}</p>
                <p className="text-sm text-gray-300">
                  {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                  {new Date(booking.endTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="font-semibold text-gray-200 mb-4">Price Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Parking Charge</span>
                <span className="font-semibold">
                  ₹{booking.amountPaid.toFixed(2)}
                </span>
              </div>

              {booking.extraAmountPaid > 0 && (
                <div className="flex justify-between items-center text-orange-400">
                  <span>Overtime Charge</span>
                  <span className="font-semibold">
                    ₹{booking.extraAmountPaid.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-green-400">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-300">
                  Arriving late? Extended parking available at hourly rate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadReceipt}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105"
          >
            <Download size={18} />
            Download Receipt
          </button>

          <button
            onClick={() => navigate("/bookings")}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 rounded-xl font-semibold transition transform hover:scale-105"
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 border border-white/20 hover:border-white/40 hover:bg-white/5 py-3 rounded-xl font-semibold transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
