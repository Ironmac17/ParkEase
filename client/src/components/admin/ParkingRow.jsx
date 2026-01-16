const ParkingRow = ({ parking, onAction }) => {
  return (
    <div className="grid grid-cols-4 text-sm py-2 border-b">
      <div>{parking.name}</div>
      <div>{parking.owner?.email}</div>
      <div>{parking.status}</div>
      <button
        onClick={() => onAction(parking)}
        className="text-blue-600"
      >
        {parking.status === "PENDING" ? "Approve" : "Suspend"}
      </button>
    </div>
  );
};

export default ParkingRow;
