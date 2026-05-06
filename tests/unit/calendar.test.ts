import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { QuestType } from "@prisma/client";

import { mapCalendarMonth } from "../../lib/calendar";

const category = {
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  id: "cat-health",
  name: "Health",
  sortOrder: 0,
  userId: "user-1",
};

function createQuest(id: string, title: string, questType: QuestType) {
  return {
    category,
    categoryId: category.id,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    description: null,
    id,
    isActive: true,
    questType,
    title,
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: "user-1",
  };
}

describe("mapCalendarMonth", () => {
  it("builds a stable month grid and excludes one-time tasks", () => {
    const calendar = mapCalendarMonth({
      completions: [],
      month: "2026-05",
      quests: [
        createQuest("quest-daily", "Morning Run", QuestType.DAILY),
        createQuest("quest-weekly", "Weekly Review", QuestType.WEEKLY),
        createQuest("quest-monthly", "Budget Review", QuestType.MONTHLY),
        createQuest("quest-main", "One-time Move", QuestType.MAIN),
      ],
      referenceDate: new Date("2026-05-06T05:00:00.000Z"),
    });

    assert.equal(calendar.days.length, 42);
    assert.equal(calendar.startDate, "2026-05-01");
    assert.equal(calendar.endDate, "2026-05-31");
    assert.equal(calendar.days.some((day) => day.isToday), true);
    assert.equal(
      calendar.days.some((day) =>
        day.items.some((item) => item.questId === "quest-main"),
      ),
      false,
    );

    const dailyItems = calendar.days.flatMap((day) =>
      day.items.filter((item) => item.questId === "quest-daily"),
    );
    const weeklyItems = calendar.days.flatMap((day) =>
      day.items.filter((item) => item.questId === "quest-weekly"),
    );
    const monthlyItems = calendar.days.flatMap((day) =>
      day.items.filter((item) => item.questId === "quest-monthly"),
    );

    assert.equal(dailyItems.length, 42);
    assert.deepEqual(
      weeklyItems.map((item) => item.periodKey),
      [
        "2026-W17",
        "2026-W18",
        "2026-W19",
        "2026-W20",
        "2026-W21",
        "2026-W22",
        "2026-W23",
      ],
    );
    assert.deepEqual(
      monthlyItems.map((item) => item.periodKey),
      ["2026-04", "2026-05", "2026-06"],
    );
  });

  it("attaches completion state to matching calendar items", () => {
    const calendar = mapCalendarMonth({
      completions: [
        {
          completedAt: new Date("2026-05-06T08:00:00.000Z"),
          createdAt: new Date("2026-05-06T08:00:00.000Z"),
          id: "completion-1",
          note: "Done early",
          periodKey: "2026-05-06",
          periodType: QuestType.DAILY,
          questId: "quest-daily",
          userId: "user-1",
        },
      ],
      month: "2026-05",
      quests: [createQuest("quest-daily", "Morning Run", QuestType.DAILY)],
      referenceDate: new Date("2026-05-06T05:00:00.000Z"),
    });
    const selectedDay = calendar.days.find((day) => day.date === "2026-05-06");
    const item = selectedDay?.items[0];

    assert.equal(item?.completionId, "completion-1");
    assert.equal(item?.isCompleted, true);
    assert.equal(item?.note, "Done early");
  });
});
