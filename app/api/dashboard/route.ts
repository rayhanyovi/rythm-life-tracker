import { QuestType } from "@prisma/client";

import { mapDashboardCategories } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import {
  getDateForLocalDateInput,
  getCurrentPeriodKey,
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
    categoryId: url.searchParams.get("categoryId") ?? undefined,
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
  const quests = await db.quest.findMany({
    where: {
      userId: session.user.id,
      ...(result.data.categoryId
        ? {
            categoryId: result.data.categoryId,
          }
        : {}),
      ...(result.data.includeInactive ? {} : { isActive: true }),
    },
    include: {
      category: true,
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { title: "asc" }],
  });
  const currentPeriodKeysByType = new Map(
    [QuestType.DAILY, QuestType.WEEKLY, QuestType.MONTHLY, QuestType.MAIN].map(
      (questType) => [questType, getCurrentPeriodKey(questType, effectiveDate)],
    ),
  );

  const currentCompletions = quests.length
    ? await db.questCompletion.findMany({
        where: {
          userId: session.user.id,
          questId: {
            in: quests.map((quest) => quest.id),
          },
          OR: [
            {
              periodType: QuestType.DAILY,
              periodKey: currentPeriodKeysByType.get(QuestType.DAILY),
            },
            {
              periodType: QuestType.WEEKLY,
              periodKey: currentPeriodKeysByType.get(QuestType.WEEKLY),
            },
            {
              periodType: QuestType.MONTHLY,
              periodKey: currentPeriodKeysByType.get(QuestType.MONTHLY),
            },
            {
              periodType: QuestType.MAIN,
              periodKey: currentPeriodKeysByType.get(QuestType.MAIN),
            },
          ],
        },
      })
    : [];

  const recentCompletionFloor = shiftPeriodDate(
    QuestType.MONTHLY,
    effectiveDate,
    -24,
  );
  const recentCompletions = quests.length
    ? await db.questCompletion.findMany({
        where: {
          userId: session.user.id,
          questId: {
            in: quests.map((quest) => quest.id),
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
    mapDashboardCategories(
      quests,
      currentCompletions,
      recentCompletions,
      effectiveDate,
    ),
  );
}
