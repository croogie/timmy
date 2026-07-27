import * as d3 from "d3";
import { React } from "uebersicht";
import useInterval from "../hooks/useInterval";
import useBbox from "../hooks/useBbox";
import Axis from "./axis.jsx";
import EventsList from "./eventsList.jsx";

const { useState, useRef } = React;

const grabEvents = () => {
  return [];
};

export function Component({ width, height }) {
  const [bbox, ref] = useBbox();

  const maxWidth = bbox?.width ?? 0;
  const maxHeight = bbox?.height ?? 0;

  return (
    <svg
      viewBox={`0 0 ${maxWidth} ${maxHeight}`}
      ref={ref}
      style={{
        display: "flex",
        flex: 1,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {maxHeight > 0 && (
        <>
          <Axis height={maxHeight} />
          <EventsList height={maxHeight} events={[]} />
        </>
      )}
    </svg>
  );
}
