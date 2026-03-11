import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getCurrentPeriodKey } from "@/lib/periods";
import { findOwnedQuest } from "@/lib/quests";
import { getSessionFromRequest } from "@/lib/session";
import { upsertCurrentCompletionSchema } from "@/lib/validators/completion";

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

  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }

  const result = upsertCurrentCompletionSchema.safeParse(parsedBody);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const quest = await findOwnedQuest(session.user.id, id);

  if (!quest) {
    return jsonError(404, "Quest not found.");
  }

  const periodType = quest.questType;
  const periodKey = getCurrentPeriodKey(periodType);

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
    return jsonError(404, "Quest not found.");
  }

  const periodType = quest.questType;
  const periodKey = getCurrentPeriodKey(periodType);
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
