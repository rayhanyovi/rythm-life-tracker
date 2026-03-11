import {
  type Category,
  QuestType,
  type Quest,
  type QuestCompletion,
} from "@prisma/client";

import { getCurrentPeriodKey, getLocalDateKey } from "@/lib/periods";
import { calculateCurrentStreak } from "@/lib/streaks";

type DashboardQuestRecord = Quest & {
  category: Category;
};

export function mapDashboardCategories(
  quests: DashboardQuestRecord[],
  currentCompletions: QuestCompletion[],
  recentCompletions: QuestCompletion[],
  date = new Date(),
) {
  const currentCompletionByQuestId = new Map(
    currentCompletions.map((completion) => [completion.questId, completion]),
  );
  const completionPeriodKeysByQuestId = new Map<string, string[]>();

  for (const completion of recentCompletions) {
    const nextKeys = completionPeriodKeysByQuestId.get(completion.questId) ?? [];
    nextKeys.push(completion.periodKey);
    completionPeriodKeysByQuestId.set(completion.questId, nextKeys);
  }

  const categories = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      items: Array<{
        categoryId: string;
        categoryName: string;
        completionId: string | null;
        currentPeriodKey: string;
        description: string | null;
        isActive: boolean;
        isCompletedNow: boolean;
        note: string | null;
        questId: string;
        questType: QuestType;
        streak: number | null;
        title: string;
      }>;
      sortOrder: number;
    }
  >();

  for (const quest of quests) {
    const currentPeriodKey = getCurrentPeriodKey(quest.questType, date);
    const currentCompletion = currentCompletionByQuestId.get(quest.id) ?? null;
    const completionKeys = completionPeriodKeysByQuestId.get(quest.id) ?? [];
    const categoryEntry = categories.get(quest.categoryId) ?? {
      categoryId: quest.categoryId,
      categoryName: quest.category.name,
      items: [],
      sortOrder: quest.category.sortOrder,
    };

    categoryEntry.items.push({
      questId: quest.id,
      categoryId: quest.categoryId,
      categoryName: quest.category.name,
      title: quest.title,
      description: quest.description,
      questType: quest.questType,
      isActive: quest.isActive,
      isCompletedNow: Boolean(currentCompletion),
      currentPeriodKey,
      streak: calculateCurrentStreak(quest.questType, completionKeys, date),
      completionId: currentCompletion?.id ?? null,
      note: currentCompletion?.note ?? null,
    });

    categories.set(quest.categoryId, categoryEntry);
  }

  return {
    date: getLocalDateKey(date),
    categories: [...categories.values()]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        items: category.items,
      })),
  };
}
