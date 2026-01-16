import { useEffect, useState } from "react";
import { getRemainingTime } from "../../utils/time";

const BookingCountdown = ({ endTime, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(
    getRemainingTime(endTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = getRemainingTime(endTime);
      setTimeLeft(updated);
      onTick?.(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTick]);

  if (timeLeft.expired) {
    return (
      <p className="text-sm font-semibold text-red-600">
        Overtime started
      </p>
    );
  }

  const isLastTenMinutes = timeLeft.minutes < 10;

  return (
    <p
      className={`text-sm font-semibold ${
        isLastTenMinutes
          ? "text-orange-600"
          : "text-green-700"
      }`}
    >
      Time left:{" "}
      {String(timeLeft.minutes).padStart(2, "0")}:
      {String(timeLeft.seconds).padStart(2, "0")}
    </p>
  );
};

export default BookingCountdown;
