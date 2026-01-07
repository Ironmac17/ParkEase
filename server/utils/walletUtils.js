const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }

  return wallet;
};

const creditWallet = async ({
  userId,
  amount,
  reason,
  bookingId = null,
}) => {
  const wallet = await getOrCreateWallet(userId);

  wallet.balance += amount;
  await wallet.save();

  await WalletTransaction.create({
    wallet: wallet._id,
    type: "credit",
    amount,
    reason,
    booking: bookingId,
  });

  return wallet.balance;
};

const debitWallet = async ({
  userId,
  amount,
  reason,
  bookingId = null,
}) => {
  const wallet = await getOrCreateWallet(userId);

  if (wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  wallet.balance -= amount;
  await wallet.save();

  await WalletTransaction.create({
    wallet: wallet._id,
    type: "debit",
    amount,
    reason,
    booking: bookingId,
  });

  return wallet.balance;
};

module.exports = {
  getOrCreateWallet,
  creditWallet,
  debitWallet,
};
