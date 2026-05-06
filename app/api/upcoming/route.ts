import { QuestType } from "@prisma/client";

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
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    horizon: url.searchParams.get("horizon") ?? undefined,
    questType: url.searchParams.get("questType") ?? undefined,
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

  const quests = await db.quest.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      questType: result.data.questType
        ? result.data.questType
        : {
            not: QuestType.MAIN,
          },
      ...(result.data.categoryId
        ? {
            categoryId: result.data.categoryId,
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { title: "asc" }],
  });
  const agendaWithoutCompletions = mapUpcomingAgenda({
    completions: [],
    horizonDays: result.data.horizon,
    quests,
    referenceDate: referenceDate ?? new Date(),
  });
  const completionFilters = agendaWithoutCompletions.groups.flatMap((group) =>
    group.items.map((item) => ({
      periodKey: item.periodKey,
      periodType: item.questType,
      questId: item.questId,
    })),
  );
  const completions = completionFilters.length
    ? await db.questCompletion.findMany({
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
      quests,
      referenceDate: referenceDate ?? new Date(),
    }),
  );
}
