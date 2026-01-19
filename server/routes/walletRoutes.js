const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getBalance,
  getTransactions,
  topUpWallet,
  addFunds,
} = require("../controllers/walletController");

router.use(protect);

router.get("/balance", getBalance);
router.get("/transactions", getTransactions);
router.post("/topup", topUpWallet);
router.post("/add-funds", addFunds);

module.exports = router;
