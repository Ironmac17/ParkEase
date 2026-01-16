import { useEffect, useState } from "react";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingCountdown from "./BookingCountdown";
import { extendBooking, previewExtendCost } from "../../api/bookings";

const EXTEND_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 }
];

const BookingCard = ({ booking }) => {
  const {
    _id,
    parkingLot,
    spot,
    startTime,
    endTime,
    status,
    totalAmount,
    overtimeAmount
  } = booking;

  const [selectedMinutes, setSelectedMinutes] = useState(60);
  const [previewCost, setPreviewCost] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [extending, setExtending] = useState(false);
  const [isLastMinute, setIsLastMinute] = useState(false);

  // Fetch cost preview when extend duration changes
  useEffect(() => {
    if (status !== "ACTIVE") return;

    const fetchPreview = async () => {
      try {
        setLoadingPreview(true);
        const res = await previewExtendCost(_id, selectedMinutes);
        setPreviewCost(res.data.estimatedAmount);
      } catch {
        setPreviewCost(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [_id, selectedMinutes, status]);

  const handleExtend = async () => {
    try {
      setExtending(true);
      await extendBooking(_id, selectedMinutes);
      // socket update will refresh booking state
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to extend booking");
    } finally {
      setExtending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {parkingLot?.name}
        </h3>
        <BookingStatusBadge status={status} />
      </div>

      {/* Location */}
      <p className="text-sm text-gray-600">
        Spot #{spot?.number} • {parkingLot?.address}
      </p>

      {/* Time range */}
      <p className="text-sm text-gray-700">
        {new Date(startTime).toLocaleString()} →{" "}
        {new Date(endTime).toLocaleString()}
      </p>

      {/* Countdown */}
      {status === "ACTIVE" && (
        <BookingCountdown
          endTime={endTime}
          onTick={(time) => {
            if (time.expired) {
              setIsLastMinute(true);
              return;
            }

            const totalSeconds =
              time.minutes * 60 + time.seconds;

            setIsLastMinute(totalSeconds < 60);
          }}
        />
      )}

      {/* Amounts */}
      <div className="flex justify-between text-sm font-medium">
        <span>Total Paid</span>
        <span>₹{totalAmount}</span>
      </div>

      {overtimeAmount > 0 && (
        <div className="flex justify-between text-sm text-orange-600">
          <span>Overtime</span>
          <span>₹{overtimeAmount}</span>
        </div>
      )}

      {/* Extend section */}
      {status === "ACTIVE" && (
        <div className="pt-3 border-t space-y-3">
          <div className="flex gap-2">
            {EXTEND_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedMinutes(opt.value)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedMinutes === opt.value
                    ? "bg-black text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Cost preview */}
          <div className="text-sm text-gray-700">
            {loadingPreview && <p>Calculating cost…</p>}

            {!loadingPreview && previewCost !== null && (
              <p>
                Extra cost:{" "}
                <span className="font-semibold">₹{previewCost}</span>
              </p>
            )}

            {!loadingPreview && previewCost === null && (
              <p className="text-red-500">
                Unable to calculate cost right now
              </p>
            )}
          </div>

          <button
            onClick={handleExtend}
            disabled={
              extending ||
              loadingPreview ||
              previewCost === null ||
              isLastMinute
            }
            className="w-full bg-black text-white py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {isLastMinute
              ? "Extension unavailable"
              : extending
              ? "Extending…"
              : "Confirm Extension"}
          </button>

          {isLastMinute && (
            <p className="text-xs text-red-500">
              Extension disabled in the last 1 minute
            </p>
          )}

          <p className="text-xs text-gray-500">
            Final amount may vary if pricing rules apply.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
