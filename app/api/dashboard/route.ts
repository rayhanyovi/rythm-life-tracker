import { TaskCadence, TaskKind } from "@prisma/client";

import { mapDashboardAttributes } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import {
  getDateForLocalDateInput,
  getCurrentPeriodKey,
  getLocalDateKey,
  shiftPeriodDate,
} from "@/lib/periods";
import { getSessionFromRequest } from "@/lib/session";
import { dashboardQuerySchema } from "@/lib/validators/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const url = new URL(request.url);
  const result = dashboardQuerySchema.safeParse({
    date: url.searchParams.get("date") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ??
      url.searchParams.get("attributeId") ??
      undefined,
    includeInactive: url.searchParams.get("includeInactive") ?? undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const referenceDate = result.data.date
    ? getDateForLocalDateInput(result.data.date)
    : new Date();

  if (result.data.date && !referenceDate) {
    return jsonError(400, "date must use YYYY-MM-DD format.");
  }

  const effectiveDate = referenceDate ?? new Date();

  // End of today (for dueDate <= today check on TODOs)
  const todayKey = getLocalDateKey(effectiveDate);
  const endOfToday = getDateForLocalDateInput(todayKey, undefined, 23);

  const tasks = await db.task.findMany({
    where: {
      userId: session.user.id,
      ...(result.data.categoryId
        ? {
            attributeId: result.data.categoryId,
          }
        : {}),
      ...(result.data.includeInactive ? {} : { isActive: true }),
      OR: [
        // RECURRING tasks always appear
        { taskKind: TaskKind.RECURRING },
        // TODO tasks: only if dueDate <= today
        {
          taskKind: TaskKind.TODO,
          ...(endOfToday
            ? { dueDate: { lte: endOfToday } }
            : { dueDate: { not: null } }),
        },
      ],
    },
    include: {
      attribute: true,
    },
    orderBy: [{ attribute: { sortOrder: "asc" } }, { title: "asc" }],
  });

  const currentPeriodKeysByType = new Map(
    [
      TaskCadence.DAILY,
      TaskCadence.WEEKLY,
      TaskCadence.MONTHLY,
      TaskCadence.ONCE,
    ].map((cadence) => [cadence, getCurrentPeriodKey(cadence, effectiveDate)]),
  );

  const currentCompletions = tasks.length
    ? await db.taskCompletion.findMany({
        where: {
          userId: session.user.id,
          taskId: {
            in: tasks.map((task) => task.id),
          },
          OR: [
            {
              cadence: TaskCadence.DAILY,
              periodKey: currentPeriodKeysByType.get(TaskCadence.DAILY),
            },
            {
              cadence: TaskCadence.WEEKLY,
              periodKey: currentPeriodKeysByType.get(TaskCadence.WEEKLY),
            },
            {
              cadence: TaskCadence.MONTHLY,
              periodKey: currentPeriodKeysByType.get(TaskCadence.MONTHLY),
            },
            {
              cadence: TaskCadence.ONCE,
              periodKey: currentPeriodKeysByType.get(TaskCadence.ONCE),
            },
          ],
        },
      })
    : [];

  const recentCompletionFloor = shiftPeriodDate(
    TaskCadence.MONTHLY,
    effectiveDate,
    -24,
  );
  const recentCompletions = tasks.length
    ? await db.taskCompletion.findMany({
        where: {
          userId: session.user.id,
          taskId: {
            in: tasks.map((task) => task.id),
          },
          completedAt: {
            gte: recentCompletionFloor,
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      })
    : [];

  return jsonResponse(
    mapDashboardAttributes(
      tasks,
      currentCompletions,
      recentCompletions,
      effectiveDate,
    ),
  );
}
