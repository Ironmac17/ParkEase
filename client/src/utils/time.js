export const getRemainingTime = (endTime) => {
  const diff = new Date(endTime).getTime() - Date.now();

  if (diff <= 0) {
    return {
      expired: true,
      minutes: 0,
      seconds: 0
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    expired: false,
    minutes,
    seconds
  };
};
