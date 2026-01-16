import { useEffect, useState } from "react";
import { getAdminWallets } from "../../api/wallet";

const AdminWallets = () => {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await getAdminWallets();
      setWallets(res.data.wallets);
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">
        Wallet Ledger (Audit)
      </h2>

      <div className="bg-white rounded-xl shadow-sm p-4">
        {wallets.map(w => (
          <div key={w._id} className="mb-6">
            <p className="font-medium">
              {w.user.email} — ₹{w.balance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminWallets;
