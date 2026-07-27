import * as d3 from "d3";
import * as fc from "d3fc";
import { differenceInMinutes } from "date-fns";

import { React } from "uebersicht";
const { useEffect, useRef, useState } = React;

export default function Axis({ height = 550 }) {
  const ref = useRef();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const margin = {
      top: 10,
      bottom: 10,
      left: 50,
    };
    const currentHour = now;
    const currentRoundedHour = d3.timeHour.floor(now);
    const start = d3.timeHour.offset(currentHour, -2);
    const end = d3.timeHour.offset(start, 6);
    const yScale = d3
      .scaleTime()
      .domain([start, end])
      .range([margin.top, height - margin.bottom]);

    const ticks = d3.timeHour
      .range(start, d3.timeHour.offset(start, 8))
      // filter out ticks which are close to current time
      .filter(
        (hour) =>
          Math.abs(differenceInMinutes(hour, now)) > 3 ||
          Math.abs(differenceInMinutes(hour, currentRoundedHour)) > 3,
      );
    ticks.push(now);
    ticks.push(start);

    const axisGenerator = fc
      .axisLeft(yScale)
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

    d3.select(ref.current)
      .selectAll("g.axis")
      .data([null])
      .join("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisGenerator)
      .select("path")
      .attr("stroke", "transparent");
  }, [height, now]);

  return <g ref={ref} />;
}
