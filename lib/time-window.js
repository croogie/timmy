const { addDays, addMinutes, startOfDay } = require("date-fns");

const minute = 60 * 1000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildTimeWindow(now, options) {
  const beforeMinutes = options.beforeMinutes;
  const afterMinutes = options.afterMinutes;
  const requestedOffsetMinutes = options.offsetMinutes || 0;
  const dayStart = startOfDay(now);
  const dayEnd = addDays(dayStart, 1);
  const baseStart = addMinutes(now, -beforeMinutes);
  const baseEnd = addMinutes(now, afterMinutes);
  const minOffsetMinutes = (dayStart.getTime() - baseStart.getTime()) / minute;
  const maxOffsetMinutes = (dayEnd.getTime() - baseEnd.getTime()) / minute;
  const offsetMinutes = clamp(
    requestedOffsetMinutes,
    minOffsetMinutes,
    maxOffsetMinutes,
  );

  return {
    dayEnd,
    dayStart,
    end: addMinutes(baseEnd, offsetMinutes),
    maxOffsetMinutes,
    minOffsetMinutes,
    offsetMinutes,
    start: addMinutes(baseStart, offsetMinutes),
  };
}

module.exports = {
  buildTimeWindow,
  clamp,
};
