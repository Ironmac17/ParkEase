const LotBookingRow = ({ booking }) => {
  return (
    <div className="flex justify-between text-sm py-2 border-b">
      <div>
        <p className="font-medium">
          Spot #{booking.spot?.number}
        </p>
        <p className="text-gray-500">
          User: {booking.user?.email}
        </p>
      </div>

      <p className="text-gray-600">
        Ends {new Date(booking.endTime).toLocaleTimeString()}
      </p>
    </div>
  );
};

export default LotBookingRow;
