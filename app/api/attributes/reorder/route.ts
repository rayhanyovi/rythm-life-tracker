import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { reorderAttributesSchema } from "@/lib/validators/attribute";

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

  const result = reorderAttributesSchema.safeParse(parsedBody);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const existingAttributes = await db.attribute.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const existingIds = existingAttributes.map((attribute) => attribute.id).sort();
  const requestedIds = [...result.data.attributeIds].sort();

  if (
    existingIds.length !== requestedIds.length ||
    existingIds.some((id, index) => id !== requestedIds[index])
  ) {
    return jsonError(
      400,
      "Reorder must include every Attribute in this workspace.",
    );
  }

  await db.$transaction(
    result.data.attributeIds.map((id, index) =>
      db.attribute.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  const attributes = await db.attribute.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return jsonResponse({
    attributes,
  });
}
