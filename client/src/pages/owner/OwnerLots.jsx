import { useEffect, useState } from "react";
import { getOwnerLots } from "../../api/owner";
import LotCard from "./LotCard";

const OwnerLots = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const res = await getOwnerLots();
        setLots(res.data.lots);
      } catch (err) {
        console.error("Failed to fetch lots", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, []);

  if (loading) {
    return <p className="p-6">Loading your parking lots…</p>;
  }

  if (lots.length === 0) {
    return <p className="p-6">No parking lots found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 grid gap-4">
      {lots.map(lot => (
        <LotCard key={lot._id} lot={lot} />
      ))}
    </div>
  );
};

export default OwnerLots;
