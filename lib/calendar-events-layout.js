/**
 * @typedef {Record<string, unknown> & {
 *   id: string,
 *   start: Date,
 *   end: Date,
 *   title: string,
 *   calendarId?: string
 * }} CalendarEvent
 */

/**
 * @typedef {{ maxColumns?: number }} LayoutOptions
 */

/**
 * @typedef {{
 *   column: number,
 *   columnSpan: number,
 *   columnCount: number,
 *   x: number,
 *   width: number
 * }} EventLayout
 */

/**
 * @template {CalendarEvent} T
 * @typedef {EventLayout & { event: T }} PositionedEvent
 */

/**
 * @template {CalendarEvent} T
 * @typedef {{
 *   event: T,
 *   originalIndex: number,
 *   start: number,
 *   end: number,
 *   column: number
 * }} IndexedEvent
 */

/**
 * Checks the only interval that can overlap after a lower-bound search.
 *
 * @template {CalendarEvent} T
 * @param {readonly IndexedEvent<T>[]} column
 * @param {IndexedEvent<T>} item
 */
function columnOverlaps(column, item) {
  let low = 0;
  let high = column.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = column[middle];

    if (candidate !== undefined && candidate.start < item.end) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  const candidate = column[low - 1];
  return candidate !== undefined && candidate.end > item.start;
}

/**
 * @template {CalendarEvent} T
 * @param {readonly T[]} events
 * @param {LayoutOptions} [options]
 * @returns {PositionedEvent<T>[]}
 */
export function layoutCalendarEvents(events, options) {
  if (!Array.isArray(events)) {
    throw new TypeError("events must be an array.");
  }

  if (
    options !== undefined &&
    (options === null || typeof options !== "object" || Array.isArray(options))
  ) {
    throw new TypeError("options must be an object.");
  }

  const configuredMaxColumns = options?.maxColumns;
  const maxColumns =
    configuredMaxColumns === undefined ? 3 : configuredMaxColumns;
  if (!Number.isInteger(maxColumns) || maxColumns < 1) {
    throw new RangeError("maxColumns must be a positive integer.");
  }

  if (events.length === 0) {
    return [];
  }

  const eventIds = new Set();

  for (const [index, event] of events.entries()) {
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      throw new TypeError(`Event at index ${index} must be an object.`);
    }

    if (typeof event.id !== "string" || event.id.length === 0) {
      throw new TypeError(
        `Event at index ${index} must have a non-empty string id.`,
      );
    }

    if (typeof event.title !== "string") {
      throw new TypeError(`Event "${event.id}" must have a string title.`);
    }

    if (
      event.calendarId !== undefined &&
      typeof event.calendarId !== "string"
    ) {
      throw new TypeError(`Event "${event.id}" must have a string calendarId.`);
    }

    if (
      !(event.start instanceof Date) ||
      !(event.end instanceof Date) ||
      !Number.isFinite(event.start.getTime()) ||
      !Number.isFinite(event.end.getTime())
    ) {
      throw new TypeError(
        `Event "${event.id}" must have valid Date start and end values.`,
      );
    }

    if (event.end.getTime() <= event.start.getTime()) {
      throw new RangeError(`Event "${event.id}" must end after it starts.`);
    }

    if (eventIds.has(event.id)) {
      throw new TypeError(`Duplicate event id "${event.id}".`);
    }
    eventIds.add(event.id);
  }

  const sorted = events
    .map((event, originalIndex) => ({
      event,
      originalIndex,
      start: event.start.getTime(),
      end: event.end.getTime(),
      column: -1,
    }))
    .sort(
      (left, right) =>
        left.start - right.start ||
        right.end - left.end ||
        left.originalIndex - right.originalIndex,
    );

  /** @type {IndexedEvent<T>[][]} */
  const groups = [];
  /** @type {IndexedEvent<T>[]} */
  let currentGroup = [];
  let groupMaxEnd = Number.NEGATIVE_INFINITY;

  for (const item of sorted) {
    if (currentGroup.length > 0 && item.start >= groupMaxEnd) {
      groups.push(currentGroup);
      currentGroup = [];
      groupMaxEnd = Number.NEGATIVE_INFINITY;
    }

    currentGroup.push(item);
    groupMaxEnd = Math.max(groupMaxEnd, item.end);
  }

  groups.push(currentGroup);

  /** @type {PositionedEvent<T>[]} */
  const result = new Array(events.length);

  for (const group of groups) {
    /** @type {IndexedEvent<T>[][]} */
    const columns = [];

    for (const item of group) {
      let column = columns.findIndex((candidate) => {
        const last = candidate[candidate.length - 1];
        return last !== undefined && last.end <= item.start;
      });

      if (column === -1) {
        if (columns.length >= maxColumns) {
          throw new RangeError(
            `Event "${item.event.id}" requires at least ${
              maxColumns + 1
            } columns; maxColumns is ${maxColumns}.`,
          );
        }

        column = columns.length;
        columns.push([]);
      }

      item.column = column;
      const targetColumn = columns[column];
      if (targetColumn === undefined) {
        throw new Error("Internal column assignment error.");
      }
      targetColumn.push(item);
    }

    const columnCount = columns.length;

    for (const item of group) {
      let columnSpan = 1;

      for (
        let candidateColumn = item.column + 1;
        candidateColumn < columnCount;
        candidateColumn += 1
      ) {
        const column = columns[candidateColumn];
        if (column === undefined || columnOverlaps(column, item)) {
          break;
        }
        columnSpan += 1;
      }

      result[item.originalIndex] = {
        event: item.event,
        column: item.column,
        columnSpan,
        columnCount,
        x: item.column / columnCount,
        width: columnSpan / columnCount,
      };
    }
  }

  return result;
}
