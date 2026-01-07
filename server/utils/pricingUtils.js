const Festival = require("../models/Festival");

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const getFestivalMultiplier = async (date) => {
  const festival = await Festival.findOne({
    startDate: { $lte: date },
    endDate: { $gte: date },
  }).lean();

  return festival ? festival.multiplier : null;
};

const calculateHourlyRate = async (parkingLot, date) => {
  const baseRate = parkingLot.baseRate;

  const festivalMultiplier = await getFestivalMultiplier(date);
  if (festivalMultiplier) {
    return baseRate * festivalMultiplier;
  }

  if (isWeekend(date)) {
    return baseRate * parkingLot.weekendMultiplier;
  }

  return baseRate;
};


const calculateAmount = async ({ parkingLot, fromTime, toTime }) => {
  if (toTime <= fromTime) return 0;

  const hourlyRate = await calculateHourlyRate(parkingLot, fromTime);
  const minutes = Math.ceil((toTime - fromTime) / 60000);

  return (hourlyRate / 60) * minutes;
};

module.exports = {
  calculateHourlyRate,
  calculateAmount,
};
