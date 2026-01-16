import api from "./axios";

export const getAdminDashboard = () => {
  return api.get("/admin/dashboard");
};

export const getAllUsers = () => {
  return api.get("/admin/users");
};

export const blockUser = (userId) => {
  return api.patch(`/admin/users/${userId}/block`);
};

export const unblockUser = (userId) => {
  return api.patch(`/admin/users/${userId}/unblock`);
};

export const getAllParkings = () => {
  return api.get("/admin/parkings");
};

export const approveParking = (id) => {
  return api.patch(`/admin/parkings/${id}/approve`);
};

export const suspendParking = (id) => {
  return api.patch(`/admin/parkings/${id}/suspend`);
};
