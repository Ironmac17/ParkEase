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

module.exports = {
  getBalance,
  getTransactions,
  topUpWallet,
};
