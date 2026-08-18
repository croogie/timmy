import { React } from "uebersicht";

const { useEffect, useRef } = React;

export default function useInterval(
  callback,
  delay,
  dontExecuteAtBeginning = false,
) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (!dontExecuteAtBeginning) {
      tick();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
