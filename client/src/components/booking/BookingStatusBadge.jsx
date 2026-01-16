const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-700",
  OVERTIME: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  AUTO_CHECKED_OUT: "bg-red-100 text-red-700"
};

const BookingStatusBadge = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default BookingStatusBadge;
