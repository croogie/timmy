import * as d3 from "d3";
import { React } from "uebersicht";

const { buildTimeWindow, clamp } = require("../time-window.js");
import { settings } from "../settings.js";

const { useCallback, useEffect, useMemo, useState } = React;

const margin = {
  bottom: 10,
  top: 10,
};

export default function useTimeWindow({ height, now }) {
  const [offsetMinutes, setOffsetMinutes] = useState(0);

  const windowObj = useMemo(
    () =>
      buildTimeWindow(now, {
        afterMinutes: settings.timeAfter * 60,
        beforeMinutes: settings.timeBefore * 60,
        offsetMinutes,
      }),
    [now, offsetMinutes],
  );

  useEffect(() => {
    setOffsetMinutes((current) =>
      clamp(current, windowObj.minOffsetMinutes, windowObj.maxOffsetMinutes),
    );
  }, [windowObj.maxOffsetMinutes, windowObj.minOffsetMinutes]);

  const timeScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain([windowObj.start, windowObj.end])
        .range([margin.top, height - margin.bottom]),
    [height, windowObj.end, windowObj.start],
  );

  const scrollBy = useCallback(
    (minutes) => {
      setOffsetMinutes((current) =>
        clamp(
          current + minutes,
          windowObj.minOffsetMinutes,
          windowObj.maxOffsetMinutes,
        ),
      );
    },
    [windowObj.maxOffsetMinutes, windowObj.minOffsetMinutes],
  );

  const reset = useCallback(() => {
    setOffsetMinutes(0);
  }, []);

  return {
    dayEnd: windowObj.dayEnd,
    dayStart: windowObj.dayStart,
    end: windowObj.end,
    maxOffsetMinutes: windowObj.maxOffsetMinutes,
    minOffsetMinutes: windowObj.minOffsetMinutes,
    offsetMinutes: windowObj.offsetMinutes,
    reset,
    scrollBy,
    start: windowObj.start,
    timeScale,
  };
}
