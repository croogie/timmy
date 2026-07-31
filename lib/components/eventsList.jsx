import { React } from "uebersicht";
import { layoutCalendarEvents } from "../calendar-events-layout.js";
import { getRawEvents } from "../gcal.js";
import { settings } from "../settings.js";

import * as d3 from "d3";

const { useEffect, useRef, useState } = React;

function colorWithOpacity(color, opacity) {
  const parsed = d3.color(color);
  if (!parsed) {
    return color;
  }

  parsed.opacity = opacity;
  return parsed.formatRgb();
}

export default function EventsList({ width, height, now }) {
  const [positionedEvents, setPositionedEvents] = useState(() => []);
  const ref = useRef();

  useEffect(() => {
    async function loadData() {
      console.log("checking events...");
      const events = await getRawEvents();
      setPositionedEvents(layoutCalendarEvents(events));
    }

    loadData();
  }, []);

  console.log("rerender EventsList", positionedEvents);

  const margin = { left: 50, right: 10, top: 10, bottom: 10 };
  const availableWidth = width - margin.left - margin.right;
  const availableHeight = height - margin.top - margin.bottom;
  const horizontalGap = 4;

  const currentHour = now;
  const currentRoundedHour = d3.timeHour.floor(now);
  const start = d3.timeHour.offset(currentHour, -settings.timeBefore);
  const end = d3.timeHour.offset(currentHour, settings.timeAfter);

  const timeScale = d3
    .scaleTime()
    .domain([start, end])
    .range([margin.top, height - margin.bottom]);

  const svg = d3.select(ref.current);

  const eventGroups = svg
    .selectAll("g.event")
    .data(positionedEvents)
    .join("g")
    .attr("class", "event")
    .attr("transform", (positioned) => {
      const x = margin.left + positioned.x * availableWidth;
      const y = timeScale(positioned.event.start);
      return `translate(${x},${y})`;
    });

  eventGroups.selectAll("*").remove();

  eventGroups
    .append("rect")
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("width", (positioned) =>
      Math.max(1, positioned.width * availableWidth - horizontalGap),
    )
    .attr(
      "height",
      (positioned) =>
        timeScale(positioned.event.end) - timeScale(positioned.event.start),
    )
    .attr("stroke", (positioned) => positioned.event.color)
    .attr("stroke-width", 3)
    .attr("fill", (positioned) => colorWithOpacity(positioned.event.color, 0.2))
    .attr(
      "style",
      "backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);",
    );

  eventGroups
    .append("text")
    .attr("class", "event-title")
    .attr("x", 10)
    .attr("y", 21)
    .attr("fill", "#fff")
    .text((positioned) => positioned.event.title);

  const formatTime = d3.timeFormat("%H:%M");

  eventGroups
    .append("text")
    .attr("class", "event-time")
    .attr("x", 10)
    .attr("y", 39)
    .attr("fill", "#fff")
    .attr("fill-opacity", 0.5)
    .text(
      (positioned) =>
        `${formatTime(positioned.event.start)}–${formatTime(
          positioned.event.end,
        )}`,
    );

  return <g ref={ref}></g>;
}
