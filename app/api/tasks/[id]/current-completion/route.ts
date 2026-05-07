import { TaskCadence } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getCurrentPeriodKey } from "@/lib/periods";
import { findOwnedTask } from "@/lib/tasks";
import { getSessionFromRequest } from "@/lib/session";
import { upsertCurrentCompletionSchema } from "@/lib/validators/completion";

type CompletionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** For TODO tasks cadence=null → use ONCE */
function getEffectiveCadence(cadence: TaskCadence | null): TaskCadence {
  return cadence ?? TaskCadence.ONCE;
}

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
  const task = await findOwnedTask(session.user.id, id);

  if (!task) {
    return jsonError(404, "Task not found.");
  }

  const cadence = getEffectiveCadence(task.cadence);
  const periodKey = getCurrentPeriodKey(cadence);

  const completion = await db.taskCompletion.upsert({
    where: {
      userId_taskId_cadence_periodKey: {
        userId: session.user.id,
        taskId: task.id,
        cadence,
        periodKey,
      },
    },
    update: {
      note: result.data.note ?? null,
      completedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      taskId: task.id,
      cadence,
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
  const task = await findOwnedTask(session.user.id, id);

  if (!task) {
    return jsonError(404, "Task not found.");
  }

  const cadence = getEffectiveCadence(task.cadence);
  const periodKey = getCurrentPeriodKey(cadence);
  const existingCompletion = await db.taskCompletion.findUnique({
    where: {
      userId_taskId_cadence_periodKey: {
        userId: session.user.id,
        taskId: task.id,
        cadence,
        periodKey,
      },
    },
  });

  if (!existingCompletion) {
    return new Response(null, { status: 204 });
  }

  await db.taskCompletion.delete({
    where: { id: existingCompletion.id },
  });

  return new Response(null, { status: 204 });
}
