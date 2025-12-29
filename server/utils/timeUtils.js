const moment = require("moment-timezone");

const AZ_TIMEZONE = "America/Phoenix";

const getCurrentAZTime = () => {
  return moment().tz(AZ_TIMEZONE);
};

const getTodayShortName = () => {
  return getCurrentAZTime().format("ddd");
};

module.exports = { getCurrentAZTime, getTodayShortName };
