import { Prisma, TaskCadence, TaskKind } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { findOwnedAttribute } from "@/lib/tasks";
import { getSessionFromRequest } from "@/lib/session";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validators/task";
import { getDateForLocalDateInput } from "@/lib/periods";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const url = new URL(request.url);
  const result = listTasksQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    attributeId: url.searchParams.get("attributeId") ?? undefined,
    taskKind: url.searchParams.get("taskKind") ?? undefined,
    cadence: url.searchParams.get("cadence") ?? undefined,
    includeInactive: url.searchParams.get("includeInactive") ?? undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const tasks = await db.task.findMany({
    where: {
      userId: session.user.id,
      ...(result.data.search
        ? {
            OR: [
              {
                title: {
                  contains: result.data.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: result.data.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(result.data.attributeId
        ? {
            attributeId: result.data.attributeId,
          }
        : {}),
      ...(result.data.taskKind
        ? {
            taskKind: result.data.taskKind as TaskKind,
          }
        : {}),
      ...(result.data.cadence
        ? {
            cadence: result.data.cadence as TaskCadence,
          }
        : {}),
      ...(result.data.includeInactive ? {} : { isActive: true }),
    },
    include: {
      attribute: true,
    },
    orderBy: [{ attribute: { sortOrder: "asc" } }, { title: "asc" }],
  });

  return jsonResponse({
    tasks,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = createTaskSchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const attribute = await findOwnedAttribute(session.user.id, result.data.attributeId);

  if (!attribute) {
    return jsonError(404, "Attribute not found.");
  }

  const dueDate = result.data.dueDate
    ? getDateForLocalDateInput(result.data.dueDate)
    : null;

  if (result.data.dueDate && !dueDate) {
    return jsonError(400, "dueDate must use YYYY-MM-DD format.");
  }

  try {
    const task = await db.task.create({
      data: {
        userId: session.user.id,
        attributeId: attribute.id,
        projectId: result.data.projectId ?? null,
        title: result.data.title,
        description: result.data.description ?? null,
        taskKind: result.data.taskKind as TaskKind,
        cadence: (result.data.cadence as TaskCadence) ?? null,
        dueDate: dueDate ?? null,
        habitMode: result.data.habitMode
          ? (result.data.habitMode as import("@prisma/client").HabitMode)
          : null,
        isActive: result.data.isActive ?? true,
      },
      include: {
        attribute: true,
      },
    });

    return jsonResponse(
      {
        task,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return jsonError(400, "Task references an invalid Attribute.");
    }

    throw error;
  }
}
