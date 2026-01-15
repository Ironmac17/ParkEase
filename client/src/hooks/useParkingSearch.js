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
    const res = await axios.get("/parking-lots", {
      params: { search, ...filters },
    });
    setParkingLots(res.data);
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
