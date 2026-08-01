const assert = require("assert");

const {
  buildTimeWindow,
} = require("../lib/time-window.js");

function localStamp(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join("-");
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok ${name}`);
  } catch (error) {
    console.error(`not ok ${name}`);
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  }
}

test("keeps the configured window in the middle of the day", () => {
  const now = new Date(2026, 6, 31, 12, 0, 0, 0);

  const window = buildTimeWindow(now, {
    beforeMinutes: 240,
    afterMinutes: 240,
    offsetMinutes: 0,
  });

  assert.equal(localStamp(window.start), "2026-07-31-08-00");
  assert.equal(localStamp(window.end), "2026-07-31-16-00");
  assert.equal(window.offsetMinutes, 0);
});

test("clamps the window to the start of the day", () => {
  const now = new Date(2026, 6, 31, 1, 0, 0, 0);

  const window = buildTimeWindow(now, {
    beforeMinutes: 240,
    afterMinutes: 240,
    offsetMinutes: 0,
  });

  assert.equal(localStamp(window.start), "2026-07-31-00-00");
  assert.equal(localStamp(window.end), "2026-07-31-08-00");
  assert.equal(window.offsetMinutes, 180);
});

test("clamps the window to the end of the day", () => {
  const now = new Date(2026, 6, 31, 22, 0, 0, 0);

  const window = buildTimeWindow(now, {
    beforeMinutes: 240,
    afterMinutes: 240,
    offsetMinutes: 0,
  });

  assert.equal(localStamp(window.start), "2026-07-31-16-00");
  assert.equal(localStamp(window.end), "2026-08-01-00-00");
  assert.equal(window.offsetMinutes, -120);
});

test("shifts the window forward by one hour", () => {
  const now = new Date(2026, 6, 31, 12, 0, 0, 0);

  const window = buildTimeWindow(now, {
    beforeMinutes: 240,
    afterMinutes: 240,
    offsetMinutes: 60,
  });

  assert.equal(localStamp(window.start), "2026-07-31-09-00");
  assert.equal(localStamp(window.end), "2026-07-31-17-00");
});
