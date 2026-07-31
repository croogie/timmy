import * as d3 from "d3";
import * as fc from "d3fc";
import { differenceInMinutes } from "date-fns";

import { React } from "uebersicht";
import { settings } from "../settings.js";
const { useEffect, useRef, useState } = React;

export default function Axis({ height = 550, width = 100, now }) {
  const ref = useRef();

  useEffect(() => {
    const margin = {
      top: 10,
      bottom: 10,
      left: 50,
      right: 10,
    };
    const currentHour = now;
    const currentRoundedHour = d3.timeHour.floor(now);
    const start = d3.timeHour.offset(currentHour, -settings.timeBefore);
    const end = d3.timeHour.offset(currentHour, settings.timeAfter);
    const timeScale = d3
      .scaleTime()
      .domain([start, end])
      .range([margin.top, height - margin.bottom]);

    const ticks = d3.timeHour
      .range(
        start,
        d3.timeHour.offset(start, settings.timeBefore + settings.timeAfter),
      )
      // filter out ticks which are close to current time
      .filter((hour) => {
        console.log({
          hour,
          diffNow: Math.abs(differenceInMinutes(hour, now)),
        });
        return Math.abs(differenceInMinutes(hour, now)) > 3;
      });
    ticks.push(now);
    ticks.push(start);
    ticks.push(end);

    const axisGenerator = fc
      .axisLeft(timeScale)
      .decorate((s) => {
        s.enter()
          .select("text")
          .style("fill", (d) => (d === now ? "#fc0" : "#fff"))
          .style("font-size", (d) => (d === now ? 12 : 10));
        s.enter()
          .select("path")
          .attr("stroke", (d) => (d === now ? "#fc0" : "#fff"));
      })
      .tickArguments([d3.timeMinute.every(15)])
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
      // hide vertical axis
      .select("path")
      .attr("stroke", "transparent");

    // render horizontal lines
    source
      .selectAll("line")
      .data(ticks)
      .join("line")
      .attr("stroke", (d) => (d === now ? "#fc0" : "#fff"))
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (tick) => timeScale(tick))
      .attr("y2", (tick) => timeScale(tick));
  }, [height, now]);

  return <g ref={ref} />;
}
