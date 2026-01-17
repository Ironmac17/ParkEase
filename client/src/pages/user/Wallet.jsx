import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const [balanceRes, transRes] = await Promise.all([
        axios.get("/wallet/balance"),
        axios.get("/wallet/transactions"),
      ]);
      setWallet({ balance: balanceRes.data.balance || 0 });
      setTransactions(transRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wallet");
      setWallet({ balance: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading wallet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>

        {error && (
          <div className="mb-6 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 p-4 rounded-lg">
              <WalletIcon size={32} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <h2 className="text-4xl font-bold text-white">
                ₹{wallet?.balance?.toFixed(2) || "0.00"}
              </h2>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Recent Transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === "credit"
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <TrendingUp size={20} className="text-green-400" />
                      ) : (
                        <TrendingDown size={20} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {tx.reason || tx.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      tx.type === "credit" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}₹
                    {Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
