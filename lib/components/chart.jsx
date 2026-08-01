import { React } from "uebersicht";
import useBbox from "../hooks/useBbox";
import useTimeWindow from "../hooks/useTimeWindow";
import Axis from "./axis.jsx";
import CurrentTimeMarker from "./currentTimeMarker.jsx";
import EventsList from "./eventsList.jsx";

const { useCallback, useEffect, useState } = React;

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

  const {
    end: windowEnd,
    reset,
    scrollBy,
    start: windowStart,
    timeScale,
  } = useTimeWindow({
    height: maxHeight > 0 ? maxHeight : 1,
    now,
  });

  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();
      scrollBy(event.deltaY < 0 ? -10 : 10);
    },
    [scrollBy],
  );

  const handleDoubleClick = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <svg
      viewBox={`0 0 ${maxWidth} ${maxHeight}`}
      ref={ref}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{
        display: "flex",
        flex: 1,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {maxHeight > 0 && (
        <>
          <Axis
            height={maxHeight}
            now={now}
            timeScale={timeScale}
            width={maxWidth}
            windowEnd={windowEnd}
            windowStart={windowStart}
          />
          <EventsList timeScale={timeScale} width={maxWidth} />
          <CurrentTimeMarker
            now={now}
            timeScale={timeScale}
            width={maxWidth}
          />
        </>
      )}
    </svg>
  );
}
