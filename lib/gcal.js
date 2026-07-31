import * as Uebersicht from "uebersicht";
import { parse } from "date-fns";

export async function getRawEvents() {
  const events = await Uebersicht.run(
    "/opt/homebrew/bin/gcalcli agenda \"`date '+%Y-%m-%d'` 00:00:00\" \"`date '+%Y-%m-%d'` 23:59:59\"  --tsv --nodeclined --details calendar",
  );

  const result = [];
  let id = 1;

  for (const line of events.split("\n")) {
    const [startDate, startTime, endDate, endTime, title, calendar] =
      line.split("\t");
    const start = new parse(
      `${startDate} ${startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date(),
    );
    const end = new parse(
      `${endDate} ${endTime}`,
      "yyyy-MM-dd HH:mm",
      new Date(),
    );

    if (!!startTime && startTime !== "start_time") {
      result.push({
        id: `${id++}`,
        title,
        start,
        end,
        calendarId: calendar,
        color: "#4169e1",
      });
    }
  }

  return result;
}
