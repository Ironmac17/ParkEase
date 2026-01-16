const STATUS_COLORS = {
  AVAILABLE: "bg-green-100 text-green-700",
  HELD: "bg-yellow-100 text-yellow-700",
  BOOKED: "bg-red-100 text-red-700"
};

const SpotStatusBadge = ({ status }) => {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        STATUS_COLORS[status]
      }`}
    >
      {status}
    </span>
  );
};

export default SpotStatusBadge;
