import type { QuestType } from "@prisma/client";

type CategoryRecord = {
  createdAt: Date;
  id: string;
  name: string;
  sortOrder: number;
  userId: string;
};

type QuestRecord = {
  categoryId: string;
  createdAt: Date;
  description: string | null;
  id: string;
  isActive: boolean;
  questType: QuestType;
  title: string;
  updatedAt: Date;
  userId: string;
};

type QuestCompletionRecord = {
  completedAt: Date;
  createdAt: Date;
  id: string;
  note: string | null;
  periodKey: string;
  periodType: QuestType;
  questId: string;
  userId: string;
};

type SortDirection = "asc" | "desc";

function applySelect<T extends object, TResult extends object>(
  record: T | null,
  select?: Record<string, boolean>,
) {
  if (!record) {
    return null;
  }

  if (!select) {
    return record as unknown as TResult;
  }

  const output = {} as Record<string, unknown>;

  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) {
      output[key] = (record as Record<string, unknown>)[key];
    }
  }

  return output as TResult;
}

function sortByDirection<T>(records: T[], getValue: (record: T) => number | string, direction: SortDirection) {
  return [...records].sort((left, right) => {
    const leftValue = getValue(left);
    const rightValue = getValue(right);

    if (leftValue === rightValue) {
      return 0;
    }

    if (direction === "asc") {
      return leftValue < rightValue ? -1 : 1;
    }

    return leftValue > rightValue ? -1 : 1;
  });
}

function matchesCategoryWhere(
  record: CategoryRecord,
  where?: Partial<Pick<CategoryRecord, "id" | "userId">>,
) {
  if (!where) {
    return true;
  }

  return Object.entries(where).every(
    ([key, value]) => record[key as keyof CategoryRecord] === value,
  );
}

function matchesQuestWhere(
  record: QuestRecord,
  where?: {
    categoryId?: string;
    id?: string;
    isActive?: boolean;
    questType?: QuestType;
    userId?: string;
  },
) {
  if (!where) {
    return true;
  }

  return Object.entries(where).every(
    ([key, value]) => record[key as keyof QuestRecord] === value,
  );
}

export function createInMemoryAppDb() {
  const categories: CategoryRecord[] = [];
  const quests: QuestRecord[] = [];
  const completions: QuestCompletionRecord[] = [];
  let idCounter = 0;

  const nextId = (prefix: string) => `${prefix}_${++idCounter}`;

  const db = {
    category: {
      async create({
        data,
      }: {
        data: Pick<CategoryRecord, "name" | "sortOrder" | "userId">;
      }) {
        const record: CategoryRecord = {
          createdAt: new Date(),
          id: nextId("cat"),
          ...data,
        };

        categories.push(record);

        return record;
      },
      async delete({ where }: { where: Pick<CategoryRecord, "id"> }) {
        const index = categories.findIndex((record) => record.id === where.id);

        if (index >= 0) {
          categories.splice(index, 1);
        }
      },
      async findFirst<TResult extends object>({
        orderBy,
        select,
        where,
      }: {
        orderBy?: { sortOrder: SortDirection };
        select?: Record<string, boolean>;
        where?: Partial<Pick<CategoryRecord, "id" | "userId">>;
      }) {
        const matching = categories.filter((record) => matchesCategoryWhere(record, where));
        const ordered = orderBy
          ? sortByDirection(matching, (record) => record.sortOrder, orderBy.sortOrder)
          : matching;

        return applySelect<CategoryRecord, TResult>(ordered[0] ?? null, select);
      },
      async findMany({
        orderBy,
        where,
      }: {
        orderBy?: { sortOrder: SortDirection };
        where?: Partial<Pick<CategoryRecord, "id" | "userId">>;
      }) {
        const matching = categories.filter((record) => matchesCategoryWhere(record, where));

        return orderBy
          ? sortByDirection(matching, (record) => record.sortOrder, orderBy.sortOrder)
          : [...matching];
      },
      async update({
        data,
        where,
      }: {
        data: Partial<Pick<CategoryRecord, "name">>;
        where: Pick<CategoryRecord, "id">;
      }) {
        const record = categories.find((entry) => entry.id === where.id);

        if (!record) {
          throw new Error("Category not found");
        }

        Object.assign(record, data);

        return record;
      },
    },
    quest: {
      async count({
        where,
      }: {
        where?: Partial<Pick<QuestRecord, "categoryId" | "userId">>;
      }) {
        return quests.filter((record) => matchesQuestWhere(record, where)).length;
      },
      async create({
        data,
        include,
      }: {
        data: Pick<
          QuestRecord,
          "categoryId" | "description" | "isActive" | "questType" | "title" | "userId"
        >;
        include?: { category?: boolean };
      }) {
        const record: QuestRecord = {
          createdAt: new Date(),
          id: nextId("quest"),
          updatedAt: new Date(),
          ...data,
        };

        quests.push(record);

        if (!include?.category) {
          return record;
        }

        return {
          ...record,
          category: categories.find((entry) => entry.id === record.categoryId)!,
        };
      },
      async findFirst({
        include,
        where,
      }: {
        include?: { category?: boolean };
        where?: {
          categoryId?: string;
          id?: string;
          userId?: string;
        };
      }) {
        const record = quests.find((entry) => matchesQuestWhere(entry, where));

        if (!record) {
          return null;
        }

        if (!include?.category) {
          return record;
        }

        return {
          ...record,
          category: categories.find((entry) => entry.id === record.categoryId)!,
        };
      },
      async findMany({
        include,
        orderBy,
        where,
      }: {
        include?: { category?: boolean };
        orderBy?: Array<
          | { title: SortDirection }
          | { category: { sortOrder: SortDirection } }
        >;
        where?: {
          categoryId?: string;
          isActive?: boolean;
          questType?: QuestType;
          userId?: string;
        };
      }) {
        let matching = quests.filter((record) => matchesQuestWhere(record, where));

        for (const ordering of orderBy ?? []) {
          if ("title" in ordering) {
            matching = sortByDirection(matching, (record) => record.title, ordering.title);
          }

          if ("category" in ordering) {
            matching = sortByDirection(
              matching,
              (record) =>
                categories.find((entry) => entry.id === record.categoryId)?.sortOrder ?? 0,
              ordering.category.sortOrder,
            );
          }
        }

        if (!include?.category) {
          return matching;
        }

        return matching.map((record) => ({
          ...record,
          category: categories.find((entry) => entry.id === record.categoryId)!,
        }));
      },
    },
    questCompletion: {
      async delete({ where }: { where: Pick<QuestCompletionRecord, "id"> }) {
        const index = completions.findIndex((record) => record.id === where.id);

        if (index >= 0) {
          completions.splice(index, 1);
        }
      },
      async findFirst({
        where,
      }: {
        where?: Partial<Pick<QuestCompletionRecord, "id" | "userId">>;
      }) {
        return (
          completions.find((record) =>
            Object.entries(where ?? {}).every(
              ([key, value]) => record[key as keyof QuestCompletionRecord] === value,
            ),
          ) ?? null
        );
      },
      async findMany({
        include,
        orderBy,
        take,
        where,
      }: {
        include?: { quest?: { include?: { category?: boolean } } };
        orderBy?: Array<
          | { completedAt: SortDirection }
          | { id: SortDirection }
        >;
        take?: number;
        where?: {
          completedAt?: {
            gte?: Date;
            lte?: Date;
          };
          quest?: {
            categoryId?: string;
            id?: string;
            questType?: QuestType;
            userId?: string;
          };
          userId?: string;
        };
      }) {
        let matching = completions.filter((record) => {
          if (where?.userId && record.userId !== where.userId) {
            return false;
          }

          if (where?.completedAt?.gte && record.completedAt < where.completedAt.gte) {
            return false;
          }

          if (where?.completedAt?.lte && record.completedAt > where.completedAt.lte) {
            return false;
          }

          const quest = quests.find((entry) => entry.id === record.questId);

          if (!quest) {
            return false;
          }

          if (where?.quest?.userId && quest.userId !== where.quest.userId) {
            return false;
          }

          if (where?.quest?.id && quest.id !== where.quest.id) {
            return false;
          }

          if (where?.quest?.categoryId && quest.categoryId !== where.quest.categoryId) {
            return false;
          }

          if (where?.quest?.questType && quest.questType !== where.quest.questType) {
            return false;
          }

          return true;
        });

        for (const ordering of orderBy ?? []) {
          if ("completedAt" in ordering) {
            matching = sortByDirection(
              matching,
              (record) => record.completedAt.getTime(),
              ordering.completedAt,
            );
          }

          if ("id" in ordering) {
            matching = sortByDirection(matching, (record) => record.id, ordering.id);
          }
        }

        if (typeof take === "number") {
          matching = matching.slice(0, take);
        }

        if (!include?.quest) {
          return matching;
        }

        return matching.map((record) => {
          const quest = quests.find((entry) => entry.id === record.questId)!;
          const category = categories.find((entry) => entry.id === quest.categoryId)!;

          return {
            ...record,
            quest: include.quest?.include?.category
              ? {
                  ...quest,
                  category,
                }
              : quest,
          };
        });
      },
      async findUnique({
        where,
      }: {
        where: {
          userId_questId_periodType_periodKey: Pick<
            QuestCompletionRecord,
            "periodKey" | "periodType" | "questId" | "userId"
          >;
        };
      }) {
        const lookup = where.userId_questId_periodType_periodKey;

        return (
          completions.find(
            (record) =>
              record.userId === lookup.userId &&
              record.questId === lookup.questId &&
              record.periodType === lookup.periodType &&
              record.periodKey === lookup.periodKey,
          ) ?? null
        );
      },
      async update({
        data,
        where,
      }: {
        data: Partial<Pick<QuestCompletionRecord, "completedAt" | "note">>;
        where: Pick<QuestCompletionRecord, "id">;
      }) {
        const record = completions.find((entry) => entry.id === where.id);

        if (!record) {
          throw new Error("Completion not found");
        }

        Object.assign(record, data);

        return record;
      },
      async upsert({
        create,
        update,
        where,
      }: {
        create: Pick<
          QuestCompletionRecord,
          "completedAt" | "note" | "periodKey" | "periodType" | "questId" | "userId"
        >;
        update: Partial<Pick<QuestCompletionRecord, "completedAt" | "note">>;
        where: {
          userId_questId_periodType_periodKey: Pick<
            QuestCompletionRecord,
            "periodKey" | "periodType" | "questId" | "userId"
          >;
        };
      }) {
        const existing = await db.questCompletion.findUnique({ where });

        if (existing) {
          Object.assign(existing, update);
          return existing;
        }

        const record: QuestCompletionRecord = {
          createdAt: new Date(),
          id: nextId("completion"),
          ...create,
        };

        completions.push(record);

        return record;
      },
    },
  };

  return {
    db,
    reset() {
      categories.length = 0;
      quests.length = 0;
      completions.length = 0;
      idCounter = 0;
    },
  };
}
