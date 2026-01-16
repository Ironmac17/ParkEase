const WalletBalanceCard = ({ balance }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-sm text-gray-500">Wallet Balance</p>
      <p className="text-3xl font-semibold mt-1">
        ₹{balance}
      </p>
    </div>
  );
};

export default WalletBalanceCard;
