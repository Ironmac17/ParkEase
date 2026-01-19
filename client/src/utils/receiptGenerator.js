/**
 * Receipt generator utility for ParkEase
 * Generates professional receipts with QR codes
 */

export const generateReceiptPDF = (booking, qrImage) => {
    const calculateDuration = (start, end) => {
        const diff = new Date(end) - new Date(start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const totalAmount = booking.amountPaid + (booking.extraAmountPaid || 0);
    const duration = calculateDuration(booking.startTime, booking.endTime);

    const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ParkEase Receipt - ${booking._id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 5px;
          letter-spacing: 1px;
        }
        
        .receipt-title {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .qr-section {
          text-align: center;
          margin: 30px 0;
          padding: 30px;
          background: #f9f9f9;
          border-radius: 10px;
          border: 2px dashed #ddd;
        }
        
        .qr-section img {
          max-width: 200px;
          height: auto;
        }
        
        .qr-label {
          font-size: 12px;
          color: #666;
          margin-top: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .content {
          margin: 30px 0;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-weight: 700;
          font-size: 12px;
          color: #007bff;
          text-transform: uppercase;
          margin-bottom: 12px;
          letter-spacing: 1.5px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 8px;
        }
        
        .row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }
        
        .row:last-child {
          border-bottom: none;
        }
        
        .label {
          font-weight: 500;
          color: #666;
          font-size: 13px;
        }
        
        .value {
          font-weight: 600;
          color: #333;
          font-size: 13px;
          text-align: right;
        }
        
        .summary-box {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .total-row {
          font-weight: 700;
          font-size: 18px;
          border-top: 2px solid rgba(255, 255, 255, 0.3);
          padding-top: 12px;
          margin-top: 12px;
        }
        
        .booking-id {
          text-align: center;
          margin: 30px 0;
          padding: 15px;
          background: #f0f0f0;
          border-radius: 8px;
        }
        
        .booking-id-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .booking-id-value {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 14px;
          color: #007bff;
          margin-top: 5px;
          word-break: break-all;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
        }
        
        .footer-text {
          font-size: 12px;
          color: #666;
          margin: 5px 0;
        }
        
        .footer-text strong {
          color: #007bff;
        }
        
        .thank-you {
          font-size: 16px;
          color: #007bff;
          font-weight: 700;
          margin-top: 15px;
        }
        
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">🅿️ ParkEase</div>
          <div class="receipt-title">Parking Receipt</div>
        </div>
        
        <!-- QR Code -->
        <div class="qr-section">
          <img src="${qrImage}" alt="Booking QR Code" />
          <div class="qr-label">Show this QR code at parking entry</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Parking Location -->
          <div class="section">
            <div class="section-title">📍 Parking Location</div>
            <div class="row">
              <span class="label">Parking Lot</span>
              <span class="value">${booking.parkingLot?.name || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Address</span>
              <span class="value" style="text-align: right; max-width: 60%;">${booking.parkingLot?.address || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Spot Number</span>
              <span class="value" style="font-size: 16px; color: #007bff;">Spot ${booking.parkingSpot?.label || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Vehicle Information -->
          <div class="section">
            <div class="section-title">🚗 Vehicle Information</div>
            <div class="row">
              <span class="label">Registration</span>
              <span class="value">${booking.vehicle?.registrationNumber || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Model</span>
              <span class="value">${booking.vehicle?.model || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Color</span>
              <span class="value">${booking.vehicle?.color || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Booking Details -->
          <div class="section">
            <div class="section-title">📅 Booking Details</div>
            <div class="row">
              <span class="label">Check-In</span>
              <span class="value">${new Date(booking.startTime).toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Check-Out</span>
              <span class="value">${new Date(booking.endTime).toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Duration</span>
              <span class="value">${duration}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="value" style="text-transform: capitalize; color: #28a745;">${booking.status || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Pricing Summary -->
          <div class="summary-box">
            <div class="summary-row">
              <span>Parking Charges</span>
              <span>₹${booking.amountPaid?.toFixed(2) || '0.00'}</span>
            </div>
            ${booking.extraAmountPaid > 0 ? `
            <div class="summary-row">
              <span>Overtime Charges</span>
              <span>₹${booking.extraAmountPaid?.toFixed(2) || '0.00'}</span>
            </div>
            ` : ''}
            <div class="summary-row total-row">
              <span>Total Amount Paid</span>
              <span>₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <!-- Booking ID -->
          <div class="booking-id">
            <div class="booking-id-label">Booking Reference ID</div>
            <div class="booking-id-value">${booking._id}</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">
            Receipt Generated: ${new Date().toLocaleString()}
          </div>
          <div class="footer-text">
            Payment Method: <strong>Wallet</strong>
          </div>
          <div class="thank-you">Thank you for using ParkEase!</div>
          <div class="footer-text" style="margin-top: 15px; font-size: 10px; color: #999;">
            For support, contact support@parkease.com
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    return receiptHTML;
};

export const downloadReceiptAsImage = (booking, qrImage) => {
    const html = generateReceiptPDF(booking, qrImage);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();

    // Trigger print dialog
    setTimeout(() => {
        newWindow.print();
    }, 250);
};
