import { TaskCadence } from "@prisma/client";

import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { findOwnedAttribute, findOwnedTask } from "@/lib/tasks";
import { getSessionFromRequest } from "@/lib/session";
import { getDateForLocalDateInput } from "@/lib/periods";
import { updateTaskSchema } from "@/lib/validators/task";

type TaskRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: TaskRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const task = await findOwnedTask(session.user.id, id);

  if (!task) {
    return jsonError(404, "Task not found.");
  }

  return jsonResponse({
    task,
  });
}

export async function PATCH(request: Request, context: TaskRouteContext) {
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

  const result = updateTaskSchema.safeParse(parsedBody);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const existingTask = await findOwnedTask(session.user.id, id);

  if (!existingTask) {
    return jsonError(404, "Task not found.");
  }

  if (result.data.attributeId) {
    const attribute = await findOwnedAttribute(session.user.id, result.data.attributeId);

    if (!attribute) {
      return jsonError(404, "Attribute not found.");
    }
  }

  if (result.data.cadence && result.data.cadence !== existingTask.cadence) {
    const completionCount = await db.taskCompletion.count({
      where: {
        userId: session.user.id,
        taskId: existingTask.id,
      },
    });

    if (completionCount > 0) {
      return jsonError(
        409,
        "Task cadence cannot be changed once completions already exist.",
      );
    }
  }

  let dueDate: Date | null | undefined = undefined;

  if (Object.prototype.hasOwnProperty.call(result.data, "dueDate")) {
    if (result.data.dueDate === null) {
      dueDate = null;
    } else if (result.data.dueDate) {
      dueDate = getDateForLocalDateInput(result.data.dueDate);

      if (!dueDate) {
        return jsonError(400, "dueDate must use YYYY-MM-DD format.");
      }
    }
  }

  const task = await db.task.update({
    where: { id: existingTask.id },
    data: {
      ...(result.data.attributeId
        ? {
            attributeId: result.data.attributeId,
          }
        : {}),
      ...(result.data.title ? { title: result.data.title } : {}),
      ...(Object.prototype.hasOwnProperty.call(result.data, "description")
        ? { description: result.data.description ?? null }
        : {}),
      ...(result.data.cadence
        ? { cadence: result.data.cadence as TaskCadence }
        : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
      ...(result.data.habitMode ? { habitMode: result.data.habitMode as import("@prisma/client").HabitMode } : {}),
      ...(typeof result.data.isActive === "boolean"
        ? { isActive: result.data.isActive }
        : {}),
    },
    include: {
      attribute: true,
    },
  });

  return jsonResponse({
    task,
  });
}

export async function DELETE(request: Request, context: TaskRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const task = await findOwnedTask(session.user.id, id);

  if (!task) {
    return jsonError(404, "Task not found.");
  }

  await db.task.delete({
    where: { id: task.id },
  });

  return new Response(null, { status: 204 });
}
