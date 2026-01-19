import api from "./axios";

export const getMyBookings = () => {
  return api.get("/bookings");
};

export const getBookingById = (bookingId) => {
  return api.get(`/bookings/${bookingId}`);
};

export const createBooking = (bookingData) => {
  return api.post("/bookings", bookingData);
};

export const extendBooking = (bookingId, newEndTime) => {
  return api.post(`/bookings/${bookingId}/extend`, {
    newEndTime,
  });
};

export const cancelBooking = (bookingId) => {
  return api.post(`/bookings/${bookingId}/cancel`);
};

export const checkInBooking = (bookingId) => {
  return api.post(`/bookings/${bookingId}/check-in`);
};

export const checkOutBooking = (bookingId) => {
  return api.post(`/bookings/${bookingId}/check-out`);
};

export const previewExtendCost = (bookingId, extraMinutes) => {
  return api.post(`/bookings/${bookingId}/extend/preview`, {
    extraMinutes,
  });
};
