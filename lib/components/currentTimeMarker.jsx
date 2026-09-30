import * as d3 from "d3";
import * as fc from "d3fc";

import { React } from "uebersicht";
import { addTickLabelBackgrounds } from "./tickLabelBackgrounds.js";

const { useEffect, useRef } = React;

function buildCurrentTimeAxis(timeScale, now, color) {
  return fc
    .axisLeft(timeScale)
    .decorate((selection) => {
      selection.style("opacity", 1);

      selection
        .select("text")
        .style("fill", "#000")
        .style("font-size", 14)
        .style("pointer-events", "none");

      selection.select("path").style("stroke", color).style("stroke-width", 3);
    })
    .tickSize(12)
    .tickPadding(2)
    .tickValues([now])
    .tickFormat(d3.timeFormat("%H:%M"));
}

export default function CurrentTimeMarker({
  now,
  timeScale,
  width,
  color = "#fc0",
}) {
  const ref = useRef();

  useEffect(() => {
    const margin = {
      bottom: 10,
      left: 50,
      right: 10,
      top: 10,
    };
    const y = timeScale(now);
    const source = d3.select(ref.current);
    const axisGenerator = buildCurrentTimeAxis(timeScale, now, color);

    const currentTimeAxis = source
      .selectAll("g.current-time-marker")
      .data([null])
      .join("g")
      .attr("class", "current-time-marker")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisGenerator);

    currentTimeAxis.select("path").attr("stroke", "transparent");
    addTickLabelBackgrounds(currentTimeAxis.selectAll("g.tick"), color);

    source
      .selectAll("line")
      .data([now])
      .join("line")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("opacity", 1)
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y)
      .attr("y2", y);
  }, [now, timeScale, width]);

  return <g ref={ref} />;
}
