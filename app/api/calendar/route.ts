import { TaskCadence, TaskKind } from "@prisma/client";

import { db } from "@/lib/db";
import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { getLocalDateKey } from "@/lib/periods";
import { getSessionFromRequest } from "@/lib/session";
import { mapCalendarMonth } from "@/lib/calendar";
import { calendarQuerySchema } from "@/lib/validators/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const url = new URL(request.url);
  const result = calendarQuerySchema.safeParse({
    attributeId: url.searchParams.get("attributeId") ??
      url.searchParams.get("categoryId") ??
      undefined,
    month: url.searchParams.get("month") ?? undefined,
    cadence: url.searchParams.get("cadence") ??
      url.searchParams.get("questType") ??
      undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const month = result.data.month ?? getLocalDateKey(new Date()).slice(0, 7);
  const tasks = await db.task.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      taskKind: TaskKind.RECURRING,
      ...(result.data.cadence
        ? { cadence: result.data.cadence as TaskCadence }
        : {
            cadence: {
              in: [TaskCadence.DAILY, TaskCadence.WEEKLY, TaskCadence.MONTHLY],
            },
          }),
      ...(result.data.attributeId
        ? {
            attributeId: result.data.attributeId,
          }
        : {}),
    },
    include: {
      attribute: true,
    },
    orderBy: [{ attribute: { sortOrder: "asc" } }, { title: "asc" }],
  });
  const calendarWithoutCompletions = mapCalendarMonth({
    completions: [],
    month,
    tasks,
  });
  const completionFilters = calendarWithoutCompletions.days.flatMap((day) =>
    day.items.map((item) => ({
      cadence: item.cadence as TaskCadence,
      periodKey: item.periodKey,
      taskId: item.taskId,
    })),
  );
  const completions = completionFilters.length
    ? await db.taskCompletion.findMany({
        where: {
          userId: session.user.id,
          OR: completionFilters,
        },
      })
    : [];

  return jsonResponse(
    mapCalendarMonth({
      completions,
      month,
      tasks,
    }),
  );
}
