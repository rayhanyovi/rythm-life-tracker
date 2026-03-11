import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { QuestType } from "@prisma/client";

import {
  getAppTimezone,
  getCurrentLocalDate,
  getCurrentPeriodKey,
  getDateForLocalDateInput,
  getLocalDateKey,
  parseLocalDateInput,
  shiftPeriodDate,
} from "../../lib/periods";

describe("period helpers", () => {
  it("falls back to Asia/Jakarta when no app timezone is configured", () => {
    const previousTimezone = process.env.NEXT_PUBLIC_APP_TIMEZONE;

    delete process.env.NEXT_PUBLIC_APP_TIMEZONE;
    assert.equal(getAppTimezone(), "Asia/Jakarta");

    if (previousTimezone) {
      process.env.NEXT_PUBLIC_APP_TIMEZONE = previousTimezone;
    }
  });

  it("reads app timezone from NEXT_PUBLIC_APP_TIMEZONE when provided", () => {
    const previousTimezone = process.env.NEXT_PUBLIC_APP_TIMEZONE;

    process.env.NEXT_PUBLIC_APP_TIMEZONE = "UTC";
    assert.equal(getAppTimezone(), "UTC");

    if (previousTimezone) {
      process.env.NEXT_PUBLIC_APP_TIMEZONE = previousTimezone;
      return;
    }

    delete process.env.NEXT_PUBLIC_APP_TIMEZONE;
  });

  it("parses valid local date input and rejects invalid values", () => {
    assert.deepEqual(parseLocalDateInput("2026-03-11"), {
      day: 11,
      month: 3,
      year: 2026,
    });
    assert.equal(parseLocalDateInput("11-03-2026"), null);
  });

  it("derives the local date key from the configured timezone", () => {
    const date = new Date("2026-03-11T18:30:00.000Z");

    assert.equal(getLocalDateKey(date, "Asia/Jakarta"), "2026-03-12");
    assert.equal(
      getCurrentLocalDate(date, "Asia/Jakarta").toISOString(),
      "2026-03-12T00:00:00.000Z",
    );
  });

  it("converts a local date input into the matching UTC date", () => {
    assert.equal(
      getDateForLocalDateInput("2026-03-11", "Asia/Jakarta")?.toISOString(),
      "2026-03-11T05:00:00.000Z",
    );
    assert.equal(getDateForLocalDateInput("2026/03/11", "Asia/Jakarta"), null);
  });

  it("builds the right period key for each quest type", () => {
    const date = new Date("2021-01-01T12:00:00.000Z");

    assert.equal(getCurrentPeriodKey(QuestType.MAIN, date, "UTC"), "ONE_TIME");
    assert.equal(getCurrentPeriodKey(QuestType.DAILY, date, "UTC"), "2021-01-01");
    assert.equal(getCurrentPeriodKey(QuestType.WEEKLY, date, "UTC"), "2020-W53");
    assert.equal(getCurrentPeriodKey(QuestType.MONTHLY, date, "UTC"), "2021-01");
  });

  it("shifts daily, weekly, and monthly cursor dates predictably", () => {
    assert.equal(
      shiftPeriodDate(QuestType.DAILY, new Date("2026-03-11T00:00:00.000Z"), 1)
        .toISOString(),
      "2026-03-12T00:00:00.000Z",
    );

    assert.equal(
      shiftPeriodDate(QuestType.WEEKLY, new Date("2026-03-11T00:00:00.000Z"), -1)
        .toISOString(),
      "2026-03-04T00:00:00.000Z",
    );

    assert.equal(
      shiftPeriodDate(QuestType.MONTHLY, new Date("2026-03-20T00:00:00.000Z"), -1)
        .toISOString(),
      "2026-02-01T00:00:00.000Z",
    );
  });
});
