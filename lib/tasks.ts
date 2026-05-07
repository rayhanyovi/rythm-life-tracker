import { db } from "@/lib/db";

export async function findOwnedAttribute(userId: string, attributeId: string) {
  return db.attribute.findFirst({
    where: {
      id: attributeId,
      userId,
    },
  });
}

export async function findOwnedTask(userId: string, taskId: string) {
  return db.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    include: {
      attribute: true,
    },
  });
}
