import { React } from "uebersicht";

import * as d3 from "d3";
import { isBefore, isAfter } from "date-fns";

const { useRef } = React;

function colorWithOpacity(color, opacity) {
  const parsed = d3.color(color);
  if (!parsed) {
    return color;
  }

  parsed.opacity = opacity;
  return parsed.formatRgb();
}

export default function EventsList({ positionedEvents, timeScale, width }) {
  const ref = useRef();

  const margin = { left: 50, right: 10, top: 10, bottom: 10 };
  const availableWidth = width - margin.left - margin.right;
  const horizontalGap = 4;
  const eventLineWidth = 13;

  function eventLineTransform(positioned) {
    const x =
      margin.left -
      eventLineWidth -
      4 -
      positioned.column * eventLineWidth -
      positioned.column * 2;
    const y = timeScale(positioned.event.start);
    return `translate(${x}, ${y})`;
  }

  function positionEventLineTitle(event, eventLine, title) {
    const [, y] = d3.pointer(event, eventLine.parentNode);

    title.attr(
      "transform",
      `translate(${eventLineWidth / 2 + 1}, ${y + 20}) rotate(-90)`,
    );
  }

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

  const eventLines = svg
    .selectAll("g.eventLine")
    .data(positionedEvents)
    .join("g")
    .attr("transform", eventLineTransform)
    .attr("class", "eventLine");

  const eventLineTitleLayer = svg
    .selectAll("g.event-line-titles")
    .data([null])
    .join("g")
    .attr("class", "event-line-titles")
    .raise();

  const eventLineTitles = eventLineTitleLayer
    .selectAll("g.eventLineTitle")
    .data(positionedEvents)
    .join("g")
    .attr("class", "eventLineTitle")
    .attr("transform", eventLineTransform);

  const eventLineTitleByPositioned = new Map();

  eventGroups.selectAll("*").remove();
  eventLines.selectAll("*").remove();
  eventLineTitles.selectAll("*").remove();

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
    .attr("stroke", ({ event }) => {
      if (isBefore(event.end, new Date())) {
        return "grey";
      }
      return event.color;
    })
    .attr("stroke-width", (positioned) => {
      const { start, end } = positioned.event;
      const now = new Date();

      if (isBefore(start, now)) {
        if (isAfter(end, now)) {
          // in progress
          return 3;
        }
      }

      return 1;
    })
    .attr("fill", ({ event }) =>
      colorWithOpacity(
        isBefore(event.end, new Date()) ? "grey" : event.color,
        isBefore(event.start, new Date()) && isAfter(event.end, new Date())
          ? 0.8
          : 0.2,
      ),
    )
    .style("backdrop-filter", "blur(18px)")
    .style("-webkit-backdrop-filter", "blur(18px)");

  eventLines
    .append("rect")
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("width", eventLineWidth)
    .attr("class", "event-line")
    .attr(
      "height",
      (positioned) =>
        timeScale(positioned.event.end) - timeScale(positioned.event.start),
    )
    .attr("fill", ({ event }) =>
      isBefore(event.end, new Date())
        ? colorWithOpacity(event.color, 0.4)
        : event.color,
    )
    .attr("stroke", ({ event }) => event.color)
    .attr("stroke-width", ({ event }) =>
      isBefore(event.end, new Date()) ? 1 : 0,
    )
    .style("backdrop-filter", "blur(18px)")
    .style("-webkit-backdrop-filter", "blur(18px)")
    .on("mouseenter", function (event, positioned) {
      const title = d3.select(eventLineTitleByPositioned.get(positioned));

      positionEventLineTitle(event, this, title);
      title.attr("opacity", 1);
    })
    .on("mousemove", function (event, positioned) {
      positionEventLineTitle(
        event,
        this,
        d3.select(eventLineTitleByPositioned.get(positioned)),
      );
    })
    .on("mouseleave", function (event, positioned) {
      d3.select(eventLineTitleByPositioned.get(positioned)).attr("opacity", 0);
    });

  eventLineTitles
    .append("text")
    .attr("class", "event-line-title")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff")
    .attr("letter-spacing", "2px")
    .attr("font-size", "12px")
    .attr("font-weight", 600)
    .attr("font-family", "Roboto Condensed, Roboto, sans-serif")
    .attr("opacity", 0)
    .attr("paint-order", "stroke")
    .attr("pointer-events", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 3)
    .attr("text-anchor", "end")
    .attr("transform", (positioned) => {
      const height =
        timeScale(positioned.event.end) - timeScale(positioned.event.start);
      return `translate(0, ${height / 2}) rotate(-90)`;
    })
    .text((positioned) => positioned.event.title.toUpperCase())
    .each(function (positioned) {
      eventLineTitleByPositioned.set(positioned, this);
    });

  eventGroups
    .append("text")
    .attr("class", "event-title")
    .attr("x", 10)
    .attr("y", 21)
    .attr("fill", ({ event }) =>
      colorWithOpacity("#fff", isBefore(event.end, new Date()) ? 0.8 : 1),
    )
    .text((positioned) => positioned.event.title);

  const formatTime = d3.timeFormat("%H:%M");

  eventGroups
    .append("text")
    .attr("class", "event-time")
    .attr("font-size", "12")
    .attr("x", 10)
    .attr("y", 39)
    .attr("fill", "#fff")
    .attr("fill-opacity", 0.5)
    .text(
      (positioned) =>
        `${formatTime(positioned.event.start)} – ${formatTime(
          positioned.event.end,
        )}`,
    );

  return <g ref={ref} />;
}
