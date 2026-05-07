import { TaskCadence, TaskKind } from "@prisma/client";

import { db } from "@/lib/db";
import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { getDateForLocalDateInput } from "@/lib/periods";
import { getSessionFromRequest } from "@/lib/session";
import { mapUpcomingAgenda } from "@/lib/upcoming";
import { upcomingQuerySchema } from "@/lib/validators/upcoming";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const url = new URL(request.url);
  const result = upcomingQuerySchema.safeParse({
    attributeId: url.searchParams.get("attributeId") ??
      url.searchParams.get("categoryId") ??
      undefined,
    horizon: url.searchParams.get("horizon") ?? undefined,
    cadence: url.searchParams.get("cadence") ??
      url.searchParams.get("questType") ??
      undefined,
    start: url.searchParams.get("start") ?? undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const referenceDate = result.data.start
    ? getDateForLocalDateInput(result.data.start)
    : new Date();

  if (result.data.start && !referenceDate) {
    return jsonError(400, "start must use YYYY-MM-DD format.");
  }

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
  const agendaWithoutCompletions = mapUpcomingAgenda({
    completions: [],
    horizonDays: result.data.horizon,
    tasks,
    referenceDate: referenceDate ?? new Date(),
  });
  const completionFilters = agendaWithoutCompletions.groups.flatMap((group) =>
    group.items.map((item) => ({
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
    mapUpcomingAgenda({
      completions,
      horizonDays: result.data.horizon,
      tasks,
      referenceDate: referenceDate ?? new Date(),
    }),
  );
}
