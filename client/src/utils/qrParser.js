/**
 * QR Code Parser - For parking entry/exit systems
 * Extracts booking information from ParkEase QR codes
 */

export const parseBookingQR = (qrData) => {
    try {
        // QR contains JSON stringified booking data
        const data = JSON.parse(qrData);

        return {
            success: true,
            booking: {
                bookingId: data.bookingId,
                userId: data.userId,
                spotId: data.spotId,
                lotId: data.lotId,
                lotName: data.lotName,
                spotLabel: data.spotLabel,
                vehicleRegistration: data.vehicleRegistration,
                vehicleModel: data.vehicleModel,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                amountPaid: data.amountPaid,
                userName: data.userName,
                userPhone: data.userPhone,
                timestamp: new Date(data.timestamp),
            },
        };
    } catch (err) {
        return {
            success: false,
            error: "Invalid QR code format",
        };
    }
};

export const validateBookingQR = (qrData) => {
    const parsed = parseBookingQR(qrData);

    if (!parsed.success) {
        return { valid: false, message: "Invalid QR code" };
    }

    const { booking } = parsed;
    const now = new Date();

    // Check if booking time is valid
    if (now < booking.startTime) {
        return {
            valid: false,
            message: `Booking starts at ${booking.startTime.toLocaleString()}. Please come at your scheduled time.`
        };
    }

    if (now > booking.endTime) {
        return {
            valid: false,
            message: `Booking expired at ${booking.endTime.toLocaleString()}. Please contact support for overtime charges.`
        };
    }

    return {
        valid: true,
        message: "Valid booking - You can proceed",
        booking
    };
};

export const getQRDisplayInfo = (qrData) => {
    const parsed = parseBookingQR(qrData);

    if (!parsed.success) {
        return {
            status: "error",
            info: null,
        };
    }

    const { booking } = parsed;
    const validation = validateBookingQR(qrData);

    return {
        status: validation.valid ? "valid" : "invalid",
        info: {
            bookingId: booking.bookingId,
            vehicle: `${booking.vehicleModel} (${booking.vehicleRegistration})`,
            lot: booking.lotName,
            spot: booking.spotLabel,
            user: `${booking.userName} (${booking.userPhone})`,
            checkIn: booking.startTime.toLocaleString(),
            checkOut: booking.endTime.toLocaleString(),
            amount: `₹${booking.amountPaid}`,
            message: validation.message,
        },
    };
};

export const generateQRTestData = () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    return JSON.stringify({
        bookingId: "650f1a2b3c4d5e6f7g8h9i0j",
        userId: "640f1a2b3c4d5e6f7g8h9i0j",
        spotId: "630f1a2b3c4d5e6f7g8h9i0j",
        lotId: "620f1a2b3c4d5e6f7g8h9i0j",
        lotName: "Downtown Parking Lot",
        spotLabel: "A-42",
        vehicleRegistration: "KA01AB1234",
        vehicleModel: "Toyota Fortuner",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        amountPaid: 250.50,
        userName: "John Doe",
        userPhone: "+91-9876543210",
        timestamp: new Date().toISOString(),
    });
};

export const formatQRForDisplay = (booking) => {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ParkEase Booking Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Booking ID: ${booking.bookingId}
🚗 Vehicle: ${booking.vehicleModel}
📋 Reg: ${booking.vehicleRegistration}
🏢 Lot: ${booking.lotName}
🅿️  Spot: ${booking.spotLabel}
👤 Name: ${booking.userName}
📱 Phone: ${booking.userPhone}
📍 Check-in: ${booking.startTime.toLocaleString()}
🔴 Check-out: ${booking.endTime.toLocaleString()}
💰 Amount: ₹${booking.amountPaid}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
};
