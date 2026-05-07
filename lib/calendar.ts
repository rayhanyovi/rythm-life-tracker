import {
  type Attribute,
  TaskCadence,
  TaskKind,
  type Task,
  type TaskCompletion,
} from "@prisma/client";

import { getCurrentPeriodKey, getLocalDateKey } from "@/lib/periods";

type CalendarTaskRecord = Task & {
  attribute: Attribute;
};

type CalendarMonthInput = {
  completions: TaskCompletion[];
  month: string;
  tasks: CalendarTaskRecord[];
  referenceDate?: Date;
};

type CalendarAgendaItem = {
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

function parseMonthInput(month: string) {
  const match = month.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const monthIndex = Number(match[2]) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  return {
    monthIndex,
    year: Number(match[1]),
  };
}

function getUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

function getCalendarGridDates(year: number, monthIndex: number) {
  const firstOfMonth = getUtcDate(year, monthIndex, 1);
  const startOffset = firstOfMonth.getUTCDay();
  const gridStart = getUtcDate(year, monthIndex, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getTime());
    date.setUTCDate(gridStart.getUTCDate() + index);

    return date;
  });
}

export function mapCalendarMonth({
  completions,
  month,
  tasks,
  referenceDate = new Date(),
}: CalendarMonthInput) {
  const parsedMonth = parseMonthInput(month);

  if (!parsedMonth) {
    throw new Error("Invalid calendar month.");
  }

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
  const todayKey = getLocalDateKey(referenceDate);
  const emittedPeriods = new Set<string>();
  const days = getCalendarGridDates(
    parsedMonth.year,
    parsedMonth.monthIndex,
  ).map((date) => {
    const dateKey = getLocalDateKey(date);
    const items: CalendarAgendaItem[] = [];

    for (const task of tasks) {
      if (task.taskKind !== TaskKind.RECURRING || !isRecurringCadence(task.cadence)) {
        continue;
      }

      const periodKey = getCurrentPeriodKey(task.cadence, date);
      const emissionKey = getCompletionLookupKey({
        cadence: task.cadence,
        periodKey,
        taskId: task.id,
      });

      if (task.cadence !== TaskCadence.DAILY && emittedPeriods.has(emissionKey)) {
        continue;
      }

      emittedPeriods.add(emissionKey);

      const completion = completionByTaskPeriod.get(emissionKey) ?? null;

      items.push({
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
    }

    const sortedItems = items.sort((left, right) => {
      const attributeSort = left.attributeName.localeCompare(right.attributeName);

      return attributeSort || left.title.localeCompare(right.title);
    });

    return {
      completedCount: sortedItems.filter((item) => item.isCompleted).length,
      date: dateKey,
      dayOfMonth: date.getUTCDate(),
      inMonth: date.getUTCMonth() === parsedMonth.monthIndex,
      isToday: dateKey === todayKey,
      items: sortedItems,
      totalCount: sortedItems.length,
    };
  });

  const monthStart = getUtcDate(parsedMonth.year, parsedMonth.monthIndex, 1);
  const monthEnd = getUtcDate(parsedMonth.year, parsedMonth.monthIndex + 1, 0);

  return {
    days,
    endDate: getLocalDateKey(monthEnd),
    month,
    startDate: getLocalDateKey(monthStart),
  };
}
