const moment = require("moment-timezone");
const { getCurrentAZTime } = require("./timeUtils.js");

const applyEditLock = (timings) => {
  const now = getCurrentAZTime();

  return timings.map(row => {
    if (!row.openTime) return row;

    const openMoment = moment.tz(row.openTime, "HH:mm", "America/Phoenix");
    const lockTime = openMoment.clone().subtract(2, "hours");

    return {
      ...row,
      isLockedForEdit: now.isSameOrAfter(lockTime)
    };
  });
};

module.exports = { applyEditLock };
