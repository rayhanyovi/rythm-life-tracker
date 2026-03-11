import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
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

  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }

  const result = reorderCategoriesSchema.safeParse(parsedBody);

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
      "categoryIds must contain the full set of categories owned by the current user.",
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
