import { Prisma } from "@prisma/client";

import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { findOwnedCategory } from "@/lib/quests";
import { getSessionFromRequest } from "@/lib/session";
import {
  createQuestSchema,
  listQuestsQuerySchema,
} from "@/lib/validators/quest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const url = new URL(request.url);
  const result = listQuestsQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    questType: url.searchParams.get("questType") ?? undefined,
    includeInactive: url.searchParams.get("includeInactive") ?? undefined,
  });

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const quests = await db.quest.findMany({
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
      ...(result.data.includeInactive ? {} : { isActive: true }),
    },
    include: {
      category: true,
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { title: "asc" }],
  });

  return jsonResponse({
    quests,
  });
}

export async function POST(request: Request) {
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

  const result = createQuestSchema.safeParse(parsedBody);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const category = await findOwnedCategory(session.user.id, result.data.categoryId);

  if (!category) {
    return jsonError(404, "Category not found.");
  }

  try {
    const quest = await db.quest.create({
      data: {
        userId: session.user.id,
        categoryId: category.id,
        title: result.data.title,
        description: result.data.description ?? null,
        questType: result.data.questType,
        isActive: result.data.isActive ?? true,
      },
      include: {
        category: true,
      },
    });

    return jsonResponse(
      {
        quest,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return jsonError(400, "Quest references an invalid category.");
    }

    throw error;
  }
}
