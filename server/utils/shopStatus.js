const moment = require("moment-timezone");
const { getCurrentAZTime, getTodayShortName } = require("./timeUtils.js");

const calculateShopStatus = (timings) => {
  const now = getCurrentAZTime();
  const today = getTodayShortName();

  const todayTiming = timings.find(t => t.day === today);

  // no timing OR not open
  if (!todayTiming || !todayTiming.open || !todayTiming.openTime) {
    return "close";
  }

  const openTime = moment.tz(todayTiming.openTime, "HH:mm", "America/Phoenix");
  const closeTime = moment.tz(todayTiming.closeTime, "HH:mm", "America/Phoenix");

  // break check
  if (todayTiming.break && todayTiming.breakStart && todayTiming.breakEnd) {
    const breakStart = moment.tz(todayTiming.breakStart, "HH:mm", "America/Phoenix");
    const breakEnd = moment.tz(todayTiming.breakEnd, "HH:mm", "America/Phoenix");

    if (now.isBetween(breakStart, breakEnd)) {
      return "break";
    }
  }

  // open check
  if (now.isBetween(openTime, closeTime)) {
    return "open";
  }

  return "close";
};

module.exports = { calculateShopStatus };
