import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { decodeHistoryCursor, encodeHistoryCursor } from "@/lib/history";
import {
  getDateForLocalDateInput,
  getAppTimezone,
} from "@/lib/periods";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { historyQuerySchema } from "@/lib/validators/history";

const PAGE_SIZE = 50;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateRange(dateValue: string, endOfDay = false) {
  const date = getDateForLocalDateInput(
    dateValue,
    getAppTimezone(),
    endOfDay ? 23 : 0,
  );

  if (!date) {
    return null;
  }

  if (endOfDay) {
    date.setUTCMinutes(date.getUTCMinutes() + 59);
    date.setUTCSeconds(date.getUTCSeconds() + 59);
    date.setUTCMilliseconds(date.getUTCMilliseconds() + 999);
  }

  return date;
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const url = new URL(request.url);
  const result = historyQuerySchema.safeParse({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    questId: url.searchParams.get("questId") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    questType: url.searchParams.get("questType") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const fromDate = result.data.from ? getDateRange(result.data.from) : null;
  const toDate = result.data.to ? getDateRange(result.data.to, true) : null;

  if (result.data.from && !fromDate) {
    return jsonError(400, "from must use YYYY-MM-DD format.");
  }

  if (result.data.to && !toDate) {
    return jsonError(400, "to must use YYYY-MM-DD format.");
  }

  const decodedCursor = result.data.cursor
    ? decodeHistoryCursor(result.data.cursor)
    : null;

  if (result.data.cursor && !decodedCursor) {
    return jsonError(400, "cursor is invalid.");
  }

  const completions = await db.questCompletion.findMany({
    where: {
      userId: session.user.id,
      ...(fromDate || toDate
        ? {
            completedAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
      ...(decodedCursor
        ? {
            OR: [
              {
                completedAt: {
                  lt: new Date(decodedCursor.completedAt),
                },
              },
              {
                completedAt: new Date(decodedCursor.completedAt),
                id: {
                  lt: decodedCursor.id,
                },
              },
            ],
          }
        : {}),
      quest: {
        userId: session.user.id,
        ...(result.data.questId
          ? {
              id: result.data.questId,
            }
          : {}),
        ...(result.data.categoryId
          ? {
              categoryId: result.data.categoryId,
            }
          : {}),
        ...(result.data.questType
          ? {
              questType: result.data.questType,
            }
          : {}),
      },
    },
    include: {
      quest: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ completedAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
  });

  const hasMore = completions.length > PAGE_SIZE;
  const items = (hasMore ? completions.slice(0, PAGE_SIZE) : completions).map(
    (completion) => ({
      completionId: completion.id,
      completedAt: completion.completedAt.toISOString(),
      note: completion.note,
      questId: completion.questId,
      questTitle: completion.quest.title,
      questType: completion.quest.questType,
      categoryId: completion.quest.categoryId,
      categoryName: completion.quest.category.name,
      periodKey: completion.periodKey,
    }),
  );
  const lastItem = items.at(-1);

  return jsonResponse({
    items,
    nextCursor:
      hasMore && lastItem
        ? encodeHistoryCursor({
            id: lastItem.completionId,
            completedAt: lastItem.completedAt,
          })
        : null,
  });
}
