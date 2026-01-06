const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    /* ============================
       ROOM MANAGEMENT
    ============================ */

    // Join user-specific room (wallet, bookings, notifications)
    socket.on("join_user", (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      console.log(`👤 User joined room: user_${userId}`);
    });

    // Join parking lot room (spot updates, occupancy)
    socket.on("join_parking_lot", (parkingLotId) => {
      if (!parkingLotId) return;
      socket.join(`parking_lot_${parkingLotId}`);
      console.log(`🅿️ Joined parking lot: parking_lot_${parkingLotId}`);
    });

    // Join owner room (analytics, lot updates)
    socket.on("join_owner", (ownerId) => {
      if (!ownerId) return;
      socket.join(`owner_${ownerId}`);
      console.log(`👑 Owner joined room: owner_${ownerId}`);
    });

    // Leave parking lot room
    socket.on("leave_parking_lot", (parkingLotId) => {
      socket.leave(`parking_lot_${parkingLotId}`);
    });

    /* ============================
       CLIENT → SERVER EVENTS
       (acknowledgements only)
    ============================ */

    // Client confirms booking check-in via QR
    socket.on("booking_check_in", ({ bookingId }) => {
      console.log(`📅 Check-in requested for booking ${bookingId}`);
    });

    // Client confirms booking check-out
    socket.on("booking_check_out", ({ bookingId }) => {
      console.log(`📅 Check-out requested for booking ${bookingId}`);
    });

    /* ============================
       DISCONNECT
    ============================ */

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

module.exports = initSocket;
