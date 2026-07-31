import { React } from "uebersicht";
import useBbox from "../hooks/useBbox";
import Axis from "./axis.jsx";
import EventsList from "./eventsList.jsx";

const { useState, useEffect } = React;

export function Component({ width, height }) {
  const [bbox, ref] = useBbox();

  const maxWidth = bbox?.width ?? 0;
  const maxHeight = bbox?.height ?? 0;

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(id);
  }, []);

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
          <Axis height={maxHeight} now={now} width={maxWidth} />
          <EventsList height={maxHeight} now={now} width={maxWidth} />
        </>
      )}
    </svg>
  );
}
