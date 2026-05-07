import { type QuestType, TaskCadence } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getCurrentPeriodKey } from "@/lib/periods";
import { findOwnedQuest } from "@/lib/quests";
import { getSessionFromRequest } from "@/lib/session";
import { upsertCurrentCompletionSchema } from "@/lib/validators/completion";

/**
 * Bridge: legacy QuestType → TaskCadence for period key helpers.
 * DAILY/WEEKLY/MONTHLY are identical string values; MAIN maps to ONCE.
 */
function toTaskCadence(questType: QuestType): TaskCadence {
  if (questType === "MAIN") return TaskCadence.ONCE;
  return questType as unknown as TaskCadence;
}

type CompletionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: CompletionRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = upsertCurrentCompletionSchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const quest = await findOwnedQuest(session.user.id, id);

  if (!quest) {
    return jsonError(404, "Task not found.");
  }

  const periodType = quest.questType;
  const periodKey = getCurrentPeriodKey(toTaskCadence(periodType));

  const completion = await db.questCompletion.upsert({
    where: {
      userId_questId_periodType_periodKey: {
        userId: session.user.id,
        questId: quest.id,
        periodType,
        periodKey,
      },
    },
    update: {
      note: result.data.note ?? null,
      completedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      questId: quest.id,
      periodType,
      periodKey,
      completedAt: new Date(),
      note: result.data.note ?? null,
    },
  });

  return jsonResponse({
    completion,
  });
}

export async function DELETE(request: Request, context: CompletionRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const quest = await findOwnedQuest(session.user.id, id);

  if (!quest) {
    return jsonError(404, "Task not found.");
  }

  const periodType = quest.questType;
  const periodKey = getCurrentPeriodKey(toTaskCadence(periodType));
  const existingCompletion = await db.questCompletion.findUnique({
    where: {
      userId_questId_periodType_periodKey: {
        userId: session.user.id,
        questId: quest.id,
        periodType,
        periodKey,
      },
    },
  });

  if (!existingCompletion) {
    return new Response(null, { status: 204 });
  }

  await db.questCompletion.delete({
    where: { id: existingCompletion.id },
  });

  return new Response(null, { status: 204 });
}
