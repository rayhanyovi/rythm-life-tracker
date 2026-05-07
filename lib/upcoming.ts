import {
  type Attribute,
  TaskCadence,
  TaskKind,
  type Task,
  type TaskCompletion,
} from "@prisma/client";

import {
  getCurrentLocalDate,
  getCurrentPeriodKey,
  getLocalDateKey,
  shiftPeriodDate,
} from "@/lib/periods";

type UpcomingTaskRecord = Task & {
  attribute: Attribute;
};

type UpcomingAgendaInput = {
  completions: TaskCompletion[];
  horizonDays: number;
  tasks: UpcomingTaskRecord[];
  referenceDate?: Date;
};

type UpcomingAgendaItem = {
  attributeId: string;
  attributeName: string;
  cadence: Exclude<TaskCadence, "ONCE">;
  completionId: string | null;
  description: string | null;
  isCompleted: boolean;
  note: string | null;
  periodKey: string;
  taskId: string;
  title: string;
};

function isRecurringCadence(
  cadence: TaskCadence | null,
): cadence is Exclude<TaskCadence, "ONCE"> {
  return (
    cadence === TaskCadence.DAILY ||
    cadence === TaskCadence.WEEKLY ||
    cadence === TaskCadence.MONTHLY
  );
}

function getCompletionLookupKey(item: {
  cadence: TaskCadence;
  periodKey: string;
  taskId: string;
}) {
  return `${item.taskId}:${item.cadence}:${item.periodKey}`;
}

export function mapUpcomingAgenda({
  completions,
  horizonDays,
  tasks,
  referenceDate = new Date(),
}: UpcomingAgendaInput) {
  const completionByTaskPeriod = new Map(
    completions.map((completion) => [
      getCompletionLookupKey({
        cadence: completion.cadence,
        periodKey: completion.periodKey,
        taskId: completion.taskId,
      }),
      completion,
    ]),
  );
  const startDate = getCurrentLocalDate(referenceDate);
  const currentPeriodKeyByType = new Map(
    [TaskCadence.DAILY, TaskCadence.WEEKLY, TaskCadence.MONTHLY].map(
      (cadence) => [cadence, getCurrentPeriodKey(cadence, startDate)],
    ),
  );
  const emittedPeriods = new Set<string>();
  const groups = new Map<
    string,
    {
      date: string;
      items: UpcomingAgendaItem[];
    }
  >();

  for (let dayOffset = 1; dayOffset <= horizonDays; dayOffset += 1) {
    const date = shiftPeriodDate(TaskCadence.DAILY, startDate, dayOffset);
    const dateKey = getLocalDateKey(date);

    for (const task of tasks) {
      if (task.taskKind !== TaskKind.RECURRING || !isRecurringCadence(task.cadence)) {
        continue;
      }

      const periodKey = getCurrentPeriodKey(task.cadence, date);

      if (periodKey === currentPeriodKeyByType.get(task.cadence)) {
        continue;
      }

      const emissionKey = getCompletionLookupKey({
        cadence: task.cadence,
        periodKey,
        taskId: task.id,
      });

      if (emittedPeriods.has(emissionKey)) {
        continue;
      }

      emittedPeriods.add(emissionKey);

      const completion = completionByTaskPeriod.get(emissionKey) ?? null;
      const group = groups.get(dateKey) ?? {
        date: dateKey,
        items: [],
      };

      group.items.push({
        attributeId: task.attributeId,
        attributeName: task.attribute.name,
        cadence: task.cadence,
        completionId: completion?.id ?? null,
        description: task.description,
        isCompleted: Boolean(completion),
        note: completion?.note ?? null,
        periodKey,
        taskId: task.id,
        title: task.title,
      });

      groups.set(dateKey, group);
    }
  }

  const endDate = shiftPeriodDate(TaskCadence.DAILY, startDate, horizonDays);

  return {
    endDate: getLocalDateKey(endDate),
    groups: [...groups.values()]
      .map((group) => ({
        ...group,
        items: group.items.sort((left, right) => {
          const attributeSort = left.attributeName.localeCompare(right.attributeName);

          return attributeSort || left.title.localeCompare(right.title);
        }),
      }))
      .filter((group) => group.items.length > 0),
    horizonDays,
    startDate: getLocalDateKey(startDate),
  };
}
