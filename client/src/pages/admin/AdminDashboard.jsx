import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/admin";
import AdminStatCard from "../../components/admin/AdminStatCard";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res.data);
      } catch (err) {
        console.error("Admin dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6">Loading admin dashboard…</p>;
  if (!data) return <p className="p-6">Failed to load data</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard label="Users" value={data.totalUsers} />
        <AdminStatCard label="Owners" value={data.totalOwners} />
        <AdminStatCard label="Parkings" value={data.totalParkings} />
        <AdminStatCard label="Platform Revenue" value={`₹${data.totalRevenue}`} />
      </div>
    </div>
  );
};

export default AdminDashboard;
