import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Loader,
  Check,
  AlertCircle,
} from "lucide-react";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingFunds, setAddingFunds] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [amount, setAmount] = useState("100");

  useEffect(() => {
    loadWallet();
    // Poll for wallet updates every 5 seconds
    const interval = setInterval(loadWallet, 5000);
    return () => clearInterval(interval);
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
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wallet");
      setWallet({ balance: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setPaymentMessage("Please enter a valid amount");
      return;
    }

    setAddingFunds(true);
    setPaymentMessage("");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock payment success - add to wallet
      await axios.post("/wallet/add-funds", {
        amount: parseFloat(amount),
        reason: "Manual top-up",
      });

      setPaymentMessage(
        `✓ Successfully added ${formatCurrency(parseFloat(amount))} to your wallet!`,
      );
      setAmount("100");
      await loadWallet();

      setTimeout(() => setPaymentMessage(""), 3000);
    } catch (err) {
      setPaymentMessage(
        "✗ Payment failed: " + (err.response?.data?.message || "Try again"),
      );
    } finally {
      setAddingFunds(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Wallet</h1>

        {error && (
          <div className="mb-6 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Wallet Balance</p>
              <h2 className="text-5xl font-bold text-white">
                {formatCurrency(wallet?.balance)}
              </h2>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <WalletIcon size={32} className="text-blue-400" />
            </div>
          </div>

          {/* Add Funds Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Add Funds</h3>

            <div className="flex gap-2 mb-4">
              {[100, 250, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className={`px-4 py-2 rounded-lg border font-semibold transition ${
                    parseFloat(amount) === val
                      ? "bg-blue-600/30 border-blue-500/50 text-blue-300"
                      : "bg-white/5 border-white/20 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {formatCurrency(val, { decimals: 0 })}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <button
                onClick={handleAddFunds}
                disabled={addingFunds}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                {addingFunds ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pay Now
                  </>
                )}
              </button>
            </div>

            {paymentMessage && (
              <div
                className={`text-sm px-4 py-2 rounded-lg flex items-center gap-2 ${
                  paymentMessage.startsWith("✓")
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                {paymentMessage.startsWith("✓") ? (
                  <Check size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {paymentMessage}
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl ${
                        tx.type === "credit"
                          ? "bg-green-500/15"
                          : "bg-red-500/15"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <TrendingUp size={20} className="text-green-400" />
                      ) : (
                        <TrendingDown size={20} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium capitalize">
                        {tx.reason || tx.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold whitespace-nowrap ml-4 ${
                      tx.type === "credit" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount))}
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
