import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TaskCadence } from "@prisma/client";

import { calculateCurrentStreak } from "../../lib/streaks";

describe("calculateCurrentStreak", () => {
  it("returns null for ONCE cadence (to-do tasks)", () => {
    assert.equal(calculateCurrentStreak(TaskCadence.ONCE, ["ONCE"]), null);
  });

  it("counts a daily streak that includes the current period", () => {
    assert.equal(
      calculateCurrentStreak(
        TaskCadence.DAILY,
        ["2026-03-12", "2026-03-11", "2026-03-10"],
        new Date("2026-03-12T04:00:00.000Z"),
        "Asia/Jakarta",
      ),
      3,
    );
  });

  it("counts backward from the previous period when the current one is incomplete", () => {
    assert.equal(
      calculateCurrentStreak(
        TaskCadence.DAILY,
        ["2026-03-11", "2026-03-10"],
        new Date("2026-03-12T04:00:00.000Z"),
        "Asia/Jakarta",
      ),
      2,
    );
  });

  it("returns zero when neither the current nor previous period is completed", () => {
    assert.equal(
      calculateCurrentStreak(
        TaskCadence.DAILY,
        ["2026-03-10"],
        new Date("2026-03-12T04:00:00.000Z"),
        "Asia/Jakarta",
      ),
      0,
    );
  });

  it("handles weekly streaks across ISO week boundaries", () => {
    assert.equal(
      calculateCurrentStreak(
        TaskCadence.WEEKLY,
        ["2021-W01", "2020-W53"],
        new Date("2021-01-08T12:00:00.000Z"),
        "UTC",
      ),
      2,
    );
  });

  it("handles monthly streaks", () => {
    assert.equal(
      calculateCurrentStreak(
        TaskCadence.MONTHLY,
        ["2026-03", "2026-02"],
        new Date("2026-03-20T12:00:00.000Z"),
        "UTC",
      ),
      2,
    );
  });
});
