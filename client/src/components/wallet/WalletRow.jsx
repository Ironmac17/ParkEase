const WalletRow = ({ tx }) => {
  return (
    <div className="grid grid-cols-4 text-sm py-2 border-b">
      <div>{tx.reason}</div>

      <div
        className={
          tx.type === "CREDIT"
            ? "text-green-600"
            : "text-red-600"
        }
      >
        {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount}
      </div>

      <div>{tx.type}</div>

      <div>
        {new Date(tx.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default WalletRow;
