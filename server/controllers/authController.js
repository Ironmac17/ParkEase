const User = require("../models/User");
const generateJWT = require("../utils/generateJWT");

/* =========================
   REGISTER
========================= */
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

/* =========================
   LOGIN
========================= */
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

/* =========================
   GET ME
========================= */
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
