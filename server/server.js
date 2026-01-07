const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
// const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const parkingLotRoutes = require("./routes/parkingLotRoutes");
const parkingSpotRoutes = require("./routes/parkingSpotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const walletRoutes = require("./routes/walletRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const festivalRoutes = require("./routes/festivalRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");
const autoCheckoutBookings = require("./utils/autoCheckout");

// Middleware
// const errorHandler = require("./middleware/errorMiddleware");

const initSocket = require("./sockets/socket");

dotenv.config();


connectDB();


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

global.io = io;
initSocket(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

setInterval(() => {
  autoCheckoutBookings();
}, 2 * 60 * 1000);

app.get("/", (req, res) => {
  res.send("🚗 ParkEase Backend Running");
});

app.use("/api/auth", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/parking-lots", parkingLotRoutes);
app.use("/api/parking-lots", parkingSpotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/festivals", festivalRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/notifications", notificationRoutes);

// app.use(errorHandler);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`✅ ParkEase server running on port ${PORT}`);
});
