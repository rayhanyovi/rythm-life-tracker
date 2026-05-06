import { QuestType } from "@prisma/client";

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
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    month: url.searchParams.get("month") ?? undefined,
    questType: url.searchParams.get("questType") ?? undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const month = result.data.month ?? getLocalDateKey(new Date()).slice(0, 7);
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
  const calendarWithoutCompletions = mapCalendarMonth({
    completions: [],
    month,
    quests,
  });
  const completionFilters = calendarWithoutCompletions.days.flatMap((day) =>
    day.items.map((item) => ({
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
    mapCalendarMonth({
      completions,
      month,
      quests,
    }),
  );
}
