const OwnerBookingRow = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300";
      case "extended":
        return "bg-purple-500/20 text-purple-300";
      case "completed":
        return "bg-blue-500/20 text-blue-300";
      case "cancelled":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const totalCost = (booking.totalAmount || 0) + (booking.overtimeAmount || 0);

  return (
    <div className="grid grid-cols-6 gap-4 text-sm py-4 px-6 hover:bg-slate-700/30 transition border-b border-slate-700/50 text-gray-200">
      <div className="font-medium text-white">
        {booking.parkingLot?.name || "N/A"}
      </div>
      <div className="text-gray-300 font-semibold">
        #{booking.spot?.number || "N/A"}
      </div>
      <div className="text-gray-300">
        {new Date(booking.startTime).toLocaleDateString()}
      </div>
      <div className="font-bold text-green-400">
        ${totalCost.toFixed(2)}
        {booking.overtimeAmount > 0 && (
          <span className="text-orange-300 text-xs ml-1">
            (OT: ${booking.overtimeAmount.toFixed(2)})
          </span>
        )}
      </div>
      <div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}
        >
          {booking.status}
        </span>
      </div>
      <div className="text-gray-300">
        {new Date(booking.endTime).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default OwnerBookingRow;
