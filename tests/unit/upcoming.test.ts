import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TaskCadence, TaskKind } from "@prisma/client";

import { mapUpcomingAgenda } from "../../lib/upcoming";

const attribute = {
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  id: "attr-health",
  name: "Health",
  sortOrder: 0,
  userId: "user-1",
};

function createTask(
  id: string,
  title: string,
  taskKind: TaskKind,
  cadence: TaskCadence | null,
) {
  return {
    attribute,
    attributeId: attribute.id,
    cadence,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    description: null,
    dueDate: null,
    habitMode: null,
    id,
    isActive: true,
    projectId: null,
    taskKind,
    title,
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: "user-1",
  };
}

describe("mapUpcomingAgenda", () => {
  it("projects recurring tasks into future date groups without duplicating the current period", () => {
    const agenda = mapUpcomingAgenda({
      completions: [],
      horizonDays: 10,
      tasks: [
        createTask("task-daily", "Morning Run", TaskKind.RECURRING, TaskCadence.DAILY),
        createTask("task-weekly", "Weekly Review", TaskKind.RECURRING, TaskCadence.WEEKLY),
        createTask("task-todo", "One-time Move", TaskKind.TODO, null),
      ],
      referenceDate: new Date("2026-05-05T05:00:00.000Z"),
    });

    assert.equal(agenda.startDate, "2026-05-05");
    assert.equal(agenda.endDate, "2026-05-15");
    assert.equal(
      agenda.groups.some((group) =>
        group.items.some((item) => item.taskId === "task-todo"),
      ),
      false,
    );

    const dailyItems = agenda.groups.flatMap((group) =>
      group.items.filter((item) => item.taskId === "task-daily"),
    );
    const weeklyItems = agenda.groups.flatMap((group) =>
      group.items.filter((item) => item.taskId === "task-weekly"),
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
          cadence: TaskCadence.DAILY,
          completedAt: new Date("2026-05-06T08:00:00.000Z"),
          createdAt: new Date("2026-05-06T08:00:00.000Z"),
          id: "completion-1",
          note: "Done early",
          periodKey: "2026-05-06",
          taskId: "task-daily",
          userId: "user-1",
        },
      ],
      horizonDays: 1,
      tasks: [createTask("task-daily", "Morning Run", TaskKind.RECURRING, TaskCadence.DAILY)],
      referenceDate: new Date("2026-05-05T05:00:00.000Z"),
    });
    const item = agenda.groups[0]?.items[0];

    assert.equal(item?.completionId, "completion-1");
    assert.equal(item?.isCompleted, true);
    assert.equal(item?.note, "Done early");
  });
});
