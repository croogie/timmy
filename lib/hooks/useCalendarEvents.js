import { React } from "uebersicht";
import { layoutCalendarEvents } from "../calendar-events-layout.js";
import { getRawEvents } from "../gcal.js";

const { useCallback, useState } = React;

export default function useCalendarEvents() {
  const [positionedEvents, setPositionedEvents] = useState(() => []);

  const refreshEvents = useCallback(async () => {
    const events = await getRawEvents();
    setPositionedEvents(layoutCalendarEvents(events));
  }, []);

  return { positionedEvents, refreshEvents };
}
