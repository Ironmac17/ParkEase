const OwnerBookingRow = ({ booking }) => {
  return (
    <div className="grid grid-cols-6 text-sm py-3 border-b">
      <div>{booking.parkingLot?.name}</div>
      <div>#{booking.spot?.number}</div>
      <div>
        {new Date(booking.startTime).toLocaleDateString()}
      </div>
      <div>
        ₹{booking.totalAmount}
        {booking.overtimeAmount > 0 && (
          <span className="text-orange-600">
            {" "}
            +{booking.overtimeAmount}
          </span>
        )}
      </div>
      <div>{booking.status}</div>
      <div>
        {new Date(booking.endTime).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default OwnerBookingRow;
