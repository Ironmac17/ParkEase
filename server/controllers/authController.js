const User = require("../models/User");
const generateJWT = require("../utils/generateJWT");

const register = async (req, res) => {
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

  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    token: generateJWT(user._id),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

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

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateJWT(user._id),
  });
};

const getMe = async (req, res) => {
  res.json(req.user);
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
