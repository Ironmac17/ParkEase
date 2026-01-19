const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const { getOrCreateWallet } = require("../utils/walletUtils");

const getBalance = async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  res.json({ balance: wallet.balance });
};

const getTransactions = async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);

  const transactions = await WalletTransaction.find({
    wallet: wallet._id,
  }).sort({ createdAt: -1 });

  res.json(transactions);
};

const topUpWallet = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const { creditWallet } = require("../utils/walletUtils");

  const balance = await creditWallet({
    userId: req.user._id,
    amount,
    reason: "Wallet top-up",
  });

  res.json({ balance });
};

const addFunds = async (req, res) => {
  const { amount, reason } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  // Validate amount is reasonable
  if (amount > 100000) {
    return res
      .status(400)
      .json({ message: "Amount exceeds maximum limit (₹100,000)" });
  }

  const { creditWallet } = require("../utils/walletUtils");

  try {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const balance = await creditWallet({
      userId: req.user._id,
      amount,
      reason: reason || "Payment received",
    });

    res.json({
      success: true,
      message: `Successfully added ₹${amount.toFixed(2)} to wallet`,
      balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment processing failed" });
  }
};

module.exports = {
  getBalance,
  getTransactions,
  topUpWallet,
  addFunds,
};
