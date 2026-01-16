import { useEffect, useState } from "react";
import { getOwnerWallet } from "../../api/wallet";
import WalletBalanceCard from "../../components/wallet/WalletBalanceCard";
import WalletRow from "../../components/wallet/WalletRow";

const OwnerWallet = () => {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getOwnerWallet();
      setWallet(res.data);
    };
    load();
  }, []);

  if (!wallet) return <p className="p-6">Loading wallet…</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <WalletBalanceCard balance={wallet.balance} />

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold mb-3">
          Earnings Ledger
        </h2>

        <div className="grid grid-cols-4 text-xs text-gray-500 mb-2">
          <div>Reason</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Date</div>
        </div>

        {wallet.transactions.map(tx => (
          <WalletRow key={tx._id} tx={tx} />
        ))}
      </div>
    </div>
  );
};

export default OwnerWallet;
