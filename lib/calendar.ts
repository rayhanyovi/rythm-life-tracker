import {
  type Category,
  QuestType,
  type Quest,
  type QuestCompletion,
} from "@prisma/client";

import { getCurrentPeriodKey, getLocalDateKey } from "@/lib/periods";

type CalendarQuestRecord = Quest & {
  category: Category;
};

type CalendarMonthInput = {
  completions: QuestCompletion[];
  month: string;
  quests: CalendarQuestRecord[];
  referenceDate?: Date;
};

type CalendarAgendaItem = {
  categoryId: string;
  categoryName: string;
  completionId: string | null;
  description: string | null;
  isCompleted: boolean;
  note: string | null;
  periodKey: string;
  questId: string;
  questType: Exclude<QuestType, typeof QuestType.MAIN>;
  title: string;
};

function isRecurringQuestType(
  questType: QuestType,
): questType is Exclude<QuestType, typeof QuestType.MAIN> {
  return questType !== QuestType.MAIN;
}

function getCompletionLookupKey(item: {
  periodKey: string;
  questId: string;
  questType: QuestType;
}) {
  return `${item.questId}:${item.questType}:${item.periodKey}`;
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
  quests,
  referenceDate = new Date(),
}: CalendarMonthInput) {
  const parsedMonth = parseMonthInput(month);

  if (!parsedMonth) {
    throw new Error("Invalid calendar month.");
  }

  const completionByQuestPeriod = new Map(
    completions.map((completion) => [
      getCompletionLookupKey({
        periodKey: completion.periodKey,
        questId: completion.questId,
        questType: completion.periodType,
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

    for (const quest of quests) {
      if (!isRecurringQuestType(quest.questType)) {
        continue;
      }

      const periodKey = getCurrentPeriodKey(quest.questType, date);
      const emissionKey = getCompletionLookupKey({
        periodKey,
        questId: quest.id,
        questType: quest.questType,
      });

      if (quest.questType !== QuestType.DAILY && emittedPeriods.has(emissionKey)) {
        continue;
      }

      emittedPeriods.add(emissionKey);

      const completion = completionByQuestPeriod.get(emissionKey) ?? null;

      items.push({
        categoryId: quest.categoryId,
        categoryName: quest.category.name,
        completionId: completion?.id ?? null,
        description: quest.description,
        isCompleted: Boolean(completion),
        note: completion?.note ?? null,
        periodKey,
        questId: quest.id,
        questType: quest.questType,
        title: quest.title,
      });
    }

    const sortedItems = items.sort((left, right) => {
      const categorySort = left.categoryName.localeCompare(right.categoryName);

      return categorySort || left.title.localeCompare(right.title);
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
