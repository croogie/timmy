import * as d3 from "d3";
import * as fc from "d3fc";
import { differenceInSeconds } from "date-fns";

import { React } from "uebersicht";

import { settings } from "../settings.js";

const { useEffect, useRef } = React;

const hour = 60 * 60 * 1000;
const opacityStep = 0.2;
const minimumOpacity = 0.2;

function buildAxisTicks(now, windowStart, windowEnd) {
  return Array.from(
    new Set(
      [
        ...d3.timeHour.range(windowStart, windowEnd),
        now,
        windowStart,
        windowEnd,
      ].map((tick) => tick.getTime()),
    ),
  )
    .sort((a, b) => a - b)
    .map((timestamp) => new Date(timestamp));
}

function getTickOpacity(tick, currentTime, beforeHours, afterHours) {
  if (tick.getTime() === currentTime) {
    return 1;
  }

  const hoursFromNow = Math.ceil(Math.abs(tick.getTime() - currentTime) / hour);
  const opacityWindow = tick.getTime() > currentTime ? afterHours : beforeHours;
  const fullOpacityHours = Math.max(0, opacityWindow - 1);

  if (hoursFromNow <= fullOpacityHours) {
    return 1;
  }

  const fadedHours = hoursFromNow - fullOpacityHours;

  return Math.max(minimumOpacity, 1 - fadedHours * opacityStep);
}

export default function Axis({
  now,
  timeScale,
  width,
  windowEnd,
  windowStart,
}) {
  const ref = useRef();

  useEffect(() => {
    const margin = {
      bottom: 10,
      left: 50,
      right: 10,
      top: 10,
    };
    const currentTime = now.getTime();
    const ticks = buildAxisTicks(now, windowStart, windowEnd).filter(
      (tick) =>
        Math.abs(differenceInSeconds(tick.getTime(), currentTime)) >= 5 * 60,
    );

    const axisGenerator = fc
      .axisLeft(timeScale)
      .decorate((selection) => {
        selection.style("opacity", (tick) =>
          getTickOpacity(
            tick,
            currentTime,
            settings.timeBefore,
            settings.timeAfter,
          ),
        );

        selection.select("text").style("fill", "#fff").style("font-size", 10);

        selection.select("path").style("stroke", "#fff");
      })
      .tickSize(12)
      .tickPadding(2)
      .tickValues(ticks)
      .tickFormat(d3.timeFormat("%H:%M"));

    const source = d3.select(ref.current);

    source
      .selectAll("g.axis")
      .data([null])
      .join("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisGenerator)
      .select("path")
      .attr("stroke", "transparent");

    source
      .selectAll("line")
      .data(ticks)
      .join("line")
      .attr("stroke", "#fff")
      .attr("opacity", (tick) =>
        getTickOpacity(
          tick,
          currentTime,
          settings.timeBefore,
          settings.timeAfter,
        ),
      )
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (tick) => timeScale(tick))
      .attr("y2", (tick) => timeScale(tick));
  }, [now, timeScale, width, windowEnd, windowStart]);

  return <g ref={ref} />;
}
