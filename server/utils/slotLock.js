const ParkingSpot = require("../models/ParkingSpot");

/**
 * Atomically holds a parking spot for a user
 * @param {ObjectId} spotId
 * @param {ObjectId} userId
 * @param {Number} holdMinutes
 * @returns {Object|null} updated spot or null if failed
 */
const holdSpot = async (spotId, userId, holdMinutes = 5) => {
  const holdUntil = new Date(Date.now() + holdMinutes * 60 * 1000);

  /**
   * IMPORTANT:
   * - status must be "available"
   * - OR status is "held" but expired
   * - spot must not be "closed" or "occupied"
   *
   * This query is ATOMIC.
   */
  const spot = await ParkingSpot.findOneAndUpdate(
    {
      _id: spotId,
      status: { $in: ["available", "held"] },
      $or: [
        { status: "available" },
        { holdExpiresAt: { $lt: new Date() } },
      ],
    },
    {
      $set: {
        status: "held",
        heldBy: userId,
        holdExpiresAt: holdUntil,
      },
    },
    {
      new: true, // return updated doc
    }
  );

  return spot; // null = someone else got it first
};

/**
 * Releases a held spot (used on cancel / timeout)
 */
const releaseSpot = async (spotId, userId) => {
  const spot = await ParkingSpot.findOneAndUpdate(
    {
      _id: spotId,
      status: "held",
      heldBy: userId,
    },
    {
      $set: {
        status: "available",
        heldBy: null,
        holdExpiresAt: null,
      },
    },
    { new: true }
  );

  return spot;
};

module.exports = {
  holdSpot,
  releaseSpot,
};
