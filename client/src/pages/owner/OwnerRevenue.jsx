import { useEffect, useState } from "react";
import {
  getOwnerLots,
  getRevenueAnalytics
} from "../../api/owner";
import RevenueSummaryCard from "../../components/owner/RevenueSummaryCard";
import RevenueChart from "../../components/owner/RevenueChart";

const OwnerRevenue = () => {
  const [lots, setLots] = useState([]);
  const [lotId, setLotId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLots = async () => {
      const res = await getOwnerLots();
      setLots(res.data.lots);
      if (res.data.lots.length > 0) {
        setLotId(res.data.lots[0]._id);
      }
    };

    loadLots();
  }, []);

  useEffect(() => {
    if (!lotId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getRevenueAnalytics({
          lotId,
          from,
          to
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load revenue", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [lotId, from, to]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">
        Revenue Analytics
      </h2>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {lots.map(lot => (
            <option key={lot._id} value={lot._id}>
              {lot.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {loading || !data ? (
        <p>Loading analytics…</p>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <RevenueSummaryCard
              label="Total Revenue"
              value={data.totalRevenue}
            />
            <RevenueSummaryCard
              label="Overtime Revenue"
              value={data.overtimeRevenue}
            />
            <RevenueSummaryCard
              label="Net Earnings"
              value={
                data.totalRevenue
              }
            />
          </div>

          {/* Chart */}
          <RevenueChart data={data.daily} />
        </>
      )}
    </div>
  );
};

export default OwnerRevenue;
