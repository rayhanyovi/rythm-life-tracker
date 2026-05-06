import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { QuestType } from "@prisma/client";

import { mapUpcomingAgenda } from "../../lib/upcoming";

const category = {
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  id: "cat-health",
  name: "Health",
  sortOrder: 0,
  userId: "user-1",
};

function createQuest(
  id: string,
  title: string,
  questType: QuestType,
) {
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

describe("mapUpcomingAgenda", () => {
  it("projects recurring quests into future date groups without duplicating the current period", () => {
    const agenda = mapUpcomingAgenda({
      completions: [],
      horizonDays: 10,
      quests: [
        createQuest("quest-daily", "Morning Run", QuestType.DAILY),
        createQuest("quest-weekly", "Weekly Review", QuestType.WEEKLY),
        createQuest("quest-main", "One-time Move", QuestType.MAIN),
      ],
      referenceDate: new Date("2026-05-05T05:00:00.000Z"),
    });

    assert.equal(agenda.startDate, "2026-05-05");
    assert.equal(agenda.endDate, "2026-05-15");
    assert.equal(
      agenda.groups.some((group) =>
        group.items.some((item) => item.questId === "quest-main"),
      ),
      false,
    );

    const dailyItems = agenda.groups.flatMap((group) =>
      group.items.filter((item) => item.questId === "quest-daily"),
    );
    const weeklyItems = agenda.groups.flatMap((group) =>
      group.items.filter((item) => item.questId === "quest-weekly"),
    );

    assert.equal(dailyItems.length, 10);
    assert.deepEqual(
      weeklyItems.map((item) => item.periodKey),
      ["2026-W20"],
    );
  });

  it("attaches completion state for projected periods", () => {
    const agenda = mapUpcomingAgenda({
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
      horizonDays: 1,
      quests: [createQuest("quest-daily", "Morning Run", QuestType.DAILY)],
      referenceDate: new Date("2026-05-05T05:00:00.000Z"),
    });
    const item = agenda.groups[0]?.items[0];

    assert.equal(item?.completionId, "completion-1");
    assert.equal(item?.isCompleted, true);
    assert.equal(item?.note, "Done early");
  });
});
