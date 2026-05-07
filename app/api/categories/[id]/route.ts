import { Prisma } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { updateCategorySchema } from "@/lib/validators/category";

type CategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: CategoryRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = updateCategorySchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const existingCategory = await db.category.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingCategory) {
    return jsonError(404, "Habit List not found.");
  }

  try {
    const category = await db.category.update({
      where: { id: existingCategory.id },
      data: {
        name: result.data.name,
      },
    });

    return jsonResponse({
      category,
    });
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

export async function DELETE(request: Request, context: CategoryRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const existingCategory = await db.category.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingCategory) {
    return jsonError(404, "Habit List not found.");
  }

  const questCount = await db.quest.count({
    where: {
      userId: session.user.id,
      categoryId: existingCategory.id,
    },
  });

  if (questCount > 0) {
    return jsonError(
      409,
      "Habit List cannot be deleted while tasks still use it.",
    );
  }

  await db.category.delete({
    where: { id: existingCategory.id },
  });

  return new Response(null, { status: 204 });
}
