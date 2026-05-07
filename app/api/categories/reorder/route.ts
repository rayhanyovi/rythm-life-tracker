import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { reorderCategoriesSchema } from "@/lib/validators/category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = reorderCategoriesSchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const existingCategories = await db.category.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const existingIds = existingCategories.map((category) => category.id).sort();
  const requestedIds = [...result.data.categoryIds].sort();

  if (
    existingIds.length !== requestedIds.length ||
    existingIds.some((id, index) => id !== requestedIds[index])
  ) {
    return jsonError(
      400,
      "Reorder must include every Habit List in this workspace.",
    );
  }

  await db.$transaction(
    result.data.categoryIds.map((id, index) =>
      db.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  const categories = await db.category.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return jsonResponse({
    categories,
  });
}
