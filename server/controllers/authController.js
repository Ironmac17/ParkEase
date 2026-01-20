const User = require("../models/User");
const Wallet = require("../models/Wallet");
const generateJWT = require("../utils/generateJWT");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role === "owner" ? "owner" : "user",
      status: role === "owner" ? "pending" : "active",
    });

    // Create wallet for the user
    const wallet = await Wallet.create({
      user: user._id,
      balance: 0,
    });

    // Update user with wallet reference
    user.wallet = wallet._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      walletBalance: wallet.balance,
      token: generateJWT(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Owner approval pending" });
    }

    if (user.status === "banned") {
      return res.status(403).json({ message: "User is banned" });
    }

    // Get wallet balance
    let walletBalance = 0;
    if (user.wallet) {
      try {
        const wallet = await Wallet.findById(user.wallet);
        walletBalance = wallet?.balance || 0;
      } catch (walletErr) {
        console.error("Wallet fetch error:", walletErr);
        walletBalance = 0;
      }
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      walletBalance,
      token: generateJWT(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    let walletBalance = 0;

    if (!req.user.wallet) {
      // Create wallet if missing (legacy users)
      const newWallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
      });
      await User.findByIdAndUpdate(req.user._id, { wallet: newWallet._id });
      walletBalance = newWallet.balance;
    } else if (req.user.wallet.balance !== undefined) {
      // Already populated
      walletBalance = req.user.wallet.balance;
    } else {
      // Not populated, fetch it
      const walletDoc = await Wallet.findById(req.user.wallet);
      walletBalance = walletDoc?.balance || 0;
    }

    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address,
      profileImage: req.user.profileImage,
      walletBalance,
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};



const updateSettings = async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, bookingReminders, promotionalEmails, weeklyReport } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        settings: {
          emailNotifications,
          pushNotifications,
          bookingReminders,
          promotionalEmails,
          weeklyReport,
        },
      },
      { new: true }
    );

    res.json({
      message: "Settings updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updateData = {
      name: name || req.user.name,
      phone: phone || req.user.phone,
      address: address || req.user.address,
    };

    // If file is uploaded, add profile image
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

module.exports = { register, login, getMe, updateSettings, updateProfile };
