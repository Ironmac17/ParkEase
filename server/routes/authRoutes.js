const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateSettings,
  updateProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/settings", protect, updateSettings);
router.put("/profile", protect, updateProfile);

module.exports = router;
