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
          ev: filters.ev,
          security: filters.security,
          maxPrice: filters.maxPrice,
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
