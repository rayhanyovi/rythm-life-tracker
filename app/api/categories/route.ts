import { Prisma } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { createCategorySchema } from "@/lib/validators/category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const categories = await db.category.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return jsonResponse({
    categories,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = createCategorySchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const lastCategory = await db.category.findFirst({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  try {
    const category = await db.category.create({
      data: {
        userId: session.user.id,
        name: result.data.name,
        sortOrder: (lastCategory?.sortOrder ?? -1) + 1,
      },
    });

    return jsonResponse(
      {
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(409, "Habit List name must be unique per user.");
    }

    throw error;
  }
}
