import { jsonError, jsonResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { DEFAULT_ATTRIBUTE_NAMES } from "@/lib/attribute-defaults";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const [existingAttributes, existingDefaults] = await Promise.all([
    db.attribute.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
    }),
    db.attribute.findMany({
      where: {
        userId: session.user.id,
        name: {
          in: [...DEFAULT_ATTRIBUTE_NAMES],
        },
      },
      select: {
        name: true,
      },
    }),
  ]);

  const existingDefaultNames = new Set(existingDefaults.map((item) => item.name));
  const missingDefaults = DEFAULT_ATTRIBUTE_NAMES.filter(
    (name) => !existingDefaultNames.has(name),
  );

  if (missingDefaults.length > 0) {
    const nextSortOrder =
      existingAttributes.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;

    await db.attribute.createMany({
      data: missingDefaults.map((name, index) => ({
        userId: session.user.id,
        name,
        sortOrder: nextSortOrder + index,
      })),
    });
  }

  const attributes = await db.attribute.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return jsonResponse({
    attributes,
    createdNames: missingDefaults,
  });
}
