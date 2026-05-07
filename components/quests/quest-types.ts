export type QuestType = "DAILY" | "WEEKLY" | "MONTHLY" | "MAIN";

export type CategoryRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

export type QuestRecord = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  questType: QuestType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategoryRecord;
};

export type QuestsPayload = {
  quests?: QuestRecord[];
  error?: string;
};

export type CategoriesPayload = {
  categories?: CategoryRecord[];
  error?: string;
};

export type QuestMutationPayload = {
  quest?: QuestRecord;
  error?: string;
};

export type DeletePayload = {
  error?: string;
};

export type QuestFormState = {
  categoryId: string;
  title: string;
  description: string;
  questType: QuestType;
  isActive: boolean;
};

export const QUEST_TYPES: QuestType[] = ["DAILY", "WEEKLY", "MONTHLY", "MAIN"];

export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  MAIN: "Main",
};

export async function readQuestJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function formatQuestType(value: QuestType) {
  return QUEST_TYPE_LABELS[value];
}

export function createEmptyFormState(categories: CategoryRecord[]): QuestFormState {
  return {
    categoryId: categories[0]?.id ?? "",
    title: "",
    description: "",
    questType: "DAILY",
    isActive: true,
  };
}

export function createFormStateFromQuest(quest: QuestRecord): QuestFormState {
  return {
    categoryId: quest.categoryId,
    title: quest.title,
    description: quest.description ?? "",
    questType: quest.questType,
    isActive: quest.isActive,
  };
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
