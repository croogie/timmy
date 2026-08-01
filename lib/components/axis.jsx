import * as d3 from "d3";
import * as fc from "d3fc";

import { React } from "uebersicht";

const { useEffect, useRef } = React;

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
    const ticks = buildAxisTicks(now, windowStart, windowEnd);

    const axisGenerator = fc
      .axisLeft(timeScale)
      .decorate((selection) => {
        // text color and size
        selection
          .select("text")
          .style("fill", (tick) =>
            tick.getTime() === currentTime ? "#fc0" : "#fff",
          )
          .style("font-size", (tick) =>
            tick.getTime() === currentTime ? 14 : 10,
          );

        // tick color
        selection
          .select("path")
          .style("stroke", (tick) =>
            tick.getTime() === currentTime ? "#fc0" : "#fff",
          );
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
      .attr("stroke", (tick) =>
        tick.getTime() === currentTime ? "#fc0" : "#fff",
      )
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (tick) => timeScale(tick))
      .attr("y2", (tick) => timeScale(tick));
  }, [now, timeScale, width, windowEnd, windowStart]);

  return <g ref={ref} />;
}
