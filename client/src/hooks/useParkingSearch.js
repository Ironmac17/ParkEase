import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function useParkingSearch() {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    covered: false,
    ev: false,
    security: false,
    maxPrice: 500,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchLots();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filters]);

  const fetchLots = async () => {
    const res = await axios.get("/parking-lots");
    setParkingLots(res.data);
    setLoading(false);
  };

  const applyFilters = async () => {
    try {
      const res = await axios.get("/parking-lots", {
        params: {
          search,
          covered: filters.covered,
          isEV: filters.ev,
          security: filters.security,
          maxPrice: filters.maxPrice,
          startTime: filters.startTime || undefined,
          endTime: filters.endTime || undefined,
        },
      });
      setParkingLots(res.data);
    } catch (err) {
      console.error("Filter error:", err);
    }
  };

  return {
    parkingLots,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
  };
}
