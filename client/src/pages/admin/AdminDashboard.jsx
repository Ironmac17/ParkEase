import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/admin";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { useSocket } from "../../hooks/useSocket";
import { formatCurrency } from "../../utils/formatCurrency";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("booking:created", fetchDashboard);
    socket.on("booking:completed", fetchDashboard);
    socket.on("parking:approved", fetchDashboard);
    socket.on("parking:suspended", fetchDashboard);
    socket.on("user:blocked", fetchDashboard);
    socket.on("user:unblocked", fetchDashboard);

    return () => {
      socket.off("booking:created", fetchDashboard);
      socket.off("booking:completed", fetchDashboard);
      socket.off("parking:approved", fetchDashboard);
      socket.off("parking:suspended", fetchDashboard);
      socket.off("user:blocked", fetchDashboard);
      socket.off("user:unblocked", fetchDashboard);
    };
  }, [socket]);

  if (loading) return <p className="p-6">Loading admin dashboard…</p>;
  if (!data) return <p className="p-6">Failed to load data</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard label="Users" value={data.totalUsers} />
        <AdminStatCard label="Owners" value={data.totalOwners} />
        <AdminStatCard label="Parkings" value={data.totalParkings} />
        <AdminStatCard
          label="Platform Revenue"
          value={formatCurrency(data.totalRevenue)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
