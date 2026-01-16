import { useNavigate } from "react-router-dom";

const LotCard = ({ lot }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/owner/lots/${lot._id}`)}
      className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md"
    >
      <h3 className="font-semibold text-lg">{lot.name}</h3>
      <p className="text-sm text-gray-600">{lot.address}</p>

      <div className="mt-2 text-sm">
        <p>Total spots: {lot.totalSpots}</p>
        <p>Occupied: {lot.occupiedSpots}</p>
      </div>
    </div>
  );
};

export default LotCard;
