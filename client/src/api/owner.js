import api from "./axios";

export const getOwnerDashboard = () => {
  return api.get("/owner/dashboard");
};

export const getOwnerLots = () => {
  return api.get("/owner/lots");
};

export const getOwnerLotDetails = (lotId) => {
  return api.get(`/owner/lots/${lotId}`);
};

export const getOwnerBookings = (params) => {
  return api.get("/owner/bookings", { params });
};