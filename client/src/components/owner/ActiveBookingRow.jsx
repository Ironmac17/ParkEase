const ActiveBookingRow = ({ booking }) => {
  return (
    <div className="flex justify-between items-center text-sm py-2 border-b">
      <div>
        <p className="font-medium">
          {booking.parkingLot?.name}
        </p>
        <p className="text-gray-500">
          Spot #{booking.spot?.number}
        </p>
      </div>

      <div className="text-right">
        <p className="font-medium">
          ₹{booking.totalAmount}
        </p>
        <p className="text-gray-500">
          Ends {new Date(booking.endTime).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ActiveBookingRow;
