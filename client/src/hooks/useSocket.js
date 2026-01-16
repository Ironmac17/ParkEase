const socket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    /**
     * ============================
     * PARKING LOT ROOMS
     * ============================
     * Used for:
     * - real-time spot availability
     * - booking / cancel / checkout updates
     */

    socket.on("join_parking_lot", (parkingLotId) => {
      if (!parkingLotId) return;
      socket.join(`parking_lot_${parkingLotId}`);
      console.log(
        `🚗 Socket ${socket.id} joined parking_lot_${parkingLotId}`
      );
    });

    socket.on("leave_parking_lot", (parkingLotId) => {
      if (!parkingLotId) return;
      socket.leave(`parking_lot_${parkingLotId}`);
      console.log(
        `🚪 Socket ${socket.id} left parking_lot_${parkingLotId}`
      );
    });

    /**
     * ============================
     * USER ROOMS
     * ============================
     * Used for:
     * - booking updates
     * - wallet updates
     * - notifications
     */

    socket.on("join_user", (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      console.log(`👤 Socket ${socket.id} joined user_${userId}`);
    });

    socket.on("leave_user", (userId) => {
      if (!userId) return;
      socket.leave(`user_${userId}`);
      console.log(`🚪 Socket ${socket.id} left user_${userId}`);
    });

    /**
     * ============================
     * OWNER ROOMS
     * ============================
     * Used for:
     * - owner dashboard live stats
     * - spot changes across lots
     */

    socket.on("join_owner", (ownerId) => {
      if (!ownerId) return;
      socket.join(`owner_${ownerId}`);
      console.log(`🏢 Socket ${socket.id} joined owner_${ownerId}`);
    });

    socket.on("leave_owner", (ownerId) => {
      if (!ownerId) return;
      socket.leave(`owner_${ownerId}`);
      console.log(`🚪 Socket ${socket.id} left owner_${ownerId}`);
    });

    /**
     * ============================
     * ADMIN ROOM
     * ============================
     * Used for:
     * - platform-wide analytics
     * - admin live monitoring
     */

    socket.on("join_admin", () => {
      socket.join("admin");
      console.log(`🛡️ Socket ${socket.id} joined admin room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export default socket;
