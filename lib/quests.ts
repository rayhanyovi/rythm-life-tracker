import { db } from "@/lib/db";

export async function findOwnedCategory(userId: string, categoryId: string) {
  return db.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });
}

export async function findOwnedQuest(userId: string, questId: string) {
  return db.quest.findFirst({
    where: {
      id: questId,
      userId,
    },
    include: {
      category: true,
    },
  });
}
