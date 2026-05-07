import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { findOwnedCategory, findOwnedQuest } from "@/lib/quests";
import { getSessionFromRequest } from "@/lib/session";
import { updateQuestSchema } from "@/lib/validators/quest";

type QuestRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: QuestRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const quest = await findOwnedQuest(session.user.id, id);

  if (!quest) {
    return jsonError(404, "Task not found.");
  }

  return jsonResponse({
    quest,
  });
}

export async function PATCH(request: Request, context: QuestRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = updateQuestSchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const existingQuest = await findOwnedQuest(session.user.id, id);

  if (!existingQuest) {
    return jsonError(404, "Task not found.");
  }

  if (result.data.categoryId) {
    const category = await findOwnedCategory(session.user.id, result.data.categoryId);

    if (!category) {
      return jsonError(404, "Habit List not found.");
    }
  }

  if (
    result.data.questType &&
    result.data.questType !== existingQuest.questType
  ) {
    const completionCount = await db.questCompletion.count({
      where: {
        userId: session.user.id,
        questId: existingQuest.id,
      },
    });

    if (completionCount > 0) {
      return jsonError(
        409,
        "Task cadence cannot be changed once completions already exist.",
      );
    }
  }

  const quest = await db.quest.update({
    where: { id: existingQuest.id },
    data: {
      ...(result.data.categoryId
        ? {
            categoryId: result.data.categoryId,
          }
        : {}),
      ...(result.data.title ? { title: result.data.title } : {}),
      ...(Object.prototype.hasOwnProperty.call(result.data, "description")
        ? { description: result.data.description ?? null }
        : {}),
      ...(result.data.questType ? { questType: result.data.questType } : {}),
      ...(typeof result.data.isActive === "boolean"
        ? { isActive: result.data.isActive }
        : {}),
    },
    include: {
      category: true,
    },
  });

  return jsonResponse({
    quest,
  });
}

export async function DELETE(request: Request, context: QuestRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const quest = await findOwnedQuest(session.user.id, id);

  if (!quest) {
    return jsonError(404, "Task not found.");
  }

  await db.quest.delete({
    where: { id: quest.id },
  });

  return new Response(null, { status: 204 });
}
