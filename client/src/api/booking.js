import api from "./axios";

export const getMyBookings = () => {
  return api.get("/bookings/my");
};

export const extendBooking = (bookingId, extraMinutes) => {
  return api.post(`/bookings/${bookingId}/extend`, {
    extraMinutes
  });
};
export const previewExtendCost = (bookingId, extraMinutes) => {
  return api.post(`/bookings/${bookingId}/extend/preview`, {
    extraMinutes
  });
};
