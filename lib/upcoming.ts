import {
  type Category,
  QuestType,
  type Quest,
  type QuestCompletion,
} from "@prisma/client";

import {
  getCurrentLocalDate,
  getCurrentPeriodKey,
  getLocalDateKey,
  shiftPeriodDate,
} from "@/lib/periods";

type UpcomingQuestRecord = Quest & {
  category: Category;
};

type UpcomingAgendaInput = {
  completions: QuestCompletion[];
  horizonDays: number;
  quests: UpcomingQuestRecord[];
  referenceDate?: Date;
};

type UpcomingAgendaItem = {
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

export function mapUpcomingAgenda({
  completions,
  horizonDays,
  quests,
  referenceDate = new Date(),
}: UpcomingAgendaInput) {
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
  const startDate = getCurrentLocalDate(referenceDate);
  const currentPeriodKeyByType = new Map(
    [QuestType.DAILY, QuestType.WEEKLY, QuestType.MONTHLY].map((questType) => [
      questType,
      getCurrentPeriodKey(questType, startDate),
    ]),
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
    const date = shiftPeriodDate(QuestType.DAILY, startDate, dayOffset);
    const dateKey = getLocalDateKey(date);

    for (const quest of quests) {
      if (!isRecurringQuestType(quest.questType)) {
        continue;
      }

      const periodKey = getCurrentPeriodKey(quest.questType, date);

      if (periodKey === currentPeriodKeyByType.get(quest.questType)) {
        continue;
      }

      const emissionKey = getCompletionLookupKey({
        periodKey,
        questId: quest.id,
        questType: quest.questType,
      });

      if (emittedPeriods.has(emissionKey)) {
        continue;
      }

      emittedPeriods.add(emissionKey);

      const completion = completionByQuestPeriod.get(emissionKey) ?? null;
      const group = groups.get(dateKey) ?? {
        date: dateKey,
        items: [],
      };

      group.items.push({
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

      groups.set(dateKey, group);
    }
  }

  const endDate = shiftPeriodDate(QuestType.DAILY, startDate, horizonDays);

  return {
    endDate: getLocalDateKey(endDate),
    groups: [...groups.values()]
      .map((group) => ({
        ...group,
        items: group.items.sort((left, right) => {
          const categorySort = left.categoryName.localeCompare(right.categoryName);

          return categorySort || left.title.localeCompare(right.title);
        }),
      }))
      .filter((group) => group.items.length > 0),
    horizonDays,
    startDate: getLocalDateKey(startDate),
  };
}
