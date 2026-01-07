const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getBalance,
  getTransactions,
  topUpWallet,
} = require("../controllers/walletController");

router.use(protect);

router.get("/balance", getBalance);
router.get("/transactions", getTransactions);
router.post("/topup", topUpWallet);

module.exports = router;
