/**
 * Booking utilities for formatting and calculations
 */

export const formatDuration = (startTime, endTime) => {
    const diff = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
        return `${minutes}m`;
    }
    if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
};

export const calculateMinutes = (startTime, endTime) => {
    return Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60));
};

export const calculateHours = (startTime, endTime) => {
    return Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
};

export const getBookingStatusColor = (status) => {
    const colors = {
        confirmed: "bg-blue-500/20 border-blue-500 text-blue-400",
        active: "bg-green-500/20 border-green-500 text-green-400",
        completed: "bg-purple-500/20 border-purple-500 text-purple-400",
        cancelled: "bg-red-500/20 border-red-500 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 border-gray-500 text-gray-400";
};

export const getBookingStatusLabel = (status) => {
    const labels = {
        confirmed: "Confirmed",
        active: "Active",
        completed: "Completed",
        cancelled: "Cancelled",
    };
    return labels[status] || status;
};

export const isBookingActive = (booking) => {
    return booking.status === "active" || booking.status === "confirmed";
};

export const isBookingCancellable = (booking) => {
    return booking.status === "confirmed" || booking.status === "active";
};

export const canExtendBooking = (booking) => {
    return booking.status === "active";
};

export const calculateTotalAmount = (booking) => {
    return (booking.amountPaid || 0) + (booking.extraAmountPaid || 0);
};

export const formatCurrency = (amount, currency = "₹") => {
    return `${currency}${Number(amount || 0).toFixed(2)}`;
};

export const formatDateTime = (date, includeTime = true) => {
    const dateObj = new Date(date);
    if (includeTime) {
        return dateObj.toLocaleString();
    }
    return dateObj.toLocaleDateString();
};

export const getTimeUntilCheckout = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
        return { expired: true, hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, hours, minutes, seconds, total: diff };
};

export const formatTimeRemaining = (endTime) => {
    const { expired, hours, minutes, seconds } = getTimeUntilCheckout(endTime);

    if (expired) {
        return "Time's up!";
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s remaining`;
    }

    return `${seconds}s remaining`;
};

export const getPricePerMinute = (hourlyRate) => {
    return hourlyRate / 60;
};

export const calculateBookingCost = (hourlyRate, minutes) => {
    const pricePerMinute = getPricePerMinute(hourlyRate);
    return pricePerMinute * minutes;
};

export const isOvertime = (endTime) => {
    return new Date() > new Date(endTime);
};

export const getOvertimeMinutes = (endTime) => {
    if (!isOvertime(endTime)) {
        return 0;
    }
    return Math.ceil((new Date() - new Date(endTime)) / (1000 * 60));
};

export const validateBookingTimes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    const errors = [];

    if (start < now) {
        errors.push("Start time cannot be in the past");
    }

    if (end <= start) {
        errors.push("End time must be after start time");
    }

    if ((end - start) / (1000 * 60) < 30) {
        errors.push("Minimum booking duration is 30 minutes");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export const getExtensionLimits = () => {
    return {
        minMinutes: 30,
        maxMinutes: 720, // 12 hours
        maxExtensions: 10,
    };
};

export const validateExtension = (currentEndTime, newEndTime) => {
    const now = new Date();
    const current = new Date(currentEndTime);
    const newEnd = new Date(newEndTime);

    const errors = [];

    if (newEnd <= current) {
        errors.push("New end time must be after current end time");
    }

    if (now > current) {
        errors.push("Cannot extend expired bookings");
    }

    const extensionMinutes = (newEnd - current) / (1000 * 60);
    const limits = getExtensionLimits();

    if (extensionMinutes < limits.minMinutes) {
        errors.push(`Minimum extension is ${limits.minMinutes} minutes`);
    }

    if (extensionMinutes > limits.maxMinutes) {
        errors.push(`Maximum extension is ${limits.maxMinutes} minutes (12 hours)`);
    }

    return {
        valid: errors.length === 0,
        errors,
        extensionMinutes: errors.length === 0 ? extensionMinutes : 0,
    };
};

export const getCancellationRefundPercentage = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);

    // Check if within 1 hour of start time
    const minutesUntilStart = (startTime - now) / (1000 * 60);

    if (minutesUntilStart >= 60) {
        // More than 1 hour before start - full refund
        return 100;
    } else if (minutesUntilStart > 0) {
        // Less than 1 hour before start - no refund
        return 0;
    } else {
        // Already started - no refund
        return 0;
    }
};

export const getCancellationMessage = (booking) => {
    const refundPercentage = getCancellationRefundPercentage(booking);
    const refundAmount = (booking.amountPaid * refundPercentage) / 100;

    if (refundPercentage === 100) {
        return {
            status: "Full Refund",
            message: `You will receive ₹${refundAmount.toFixed(2)} back to your wallet`,
            color: "text-green-400",
        };
    } else if (refundPercentage === 0) {
        return {
            status: "No Refund",
            message: "Cancellation within 1 hour of check-in is non-refundable",
            color: "text-red-400",
        };
    } else {
        return {
            status: "Partial Refund",
            message: `You will receive ₹${refundAmount.toFixed(2)} back to your wallet`,
            color: "text-yellow-400",
        };
    }
};
