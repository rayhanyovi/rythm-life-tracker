import { Prisma } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { createAttributeSchema } from "@/lib/validators/attribute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const attributes = await db.attribute.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return jsonResponse({
    attributes,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = createAttributeSchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const lastAttribute = await db.attribute.findFirst({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  try {
    const attribute = await db.attribute.create({
      data: {
        userId: session.user.id,
        name: result.data.name,
        sortOrder: (lastAttribute?.sortOrder ?? -1) + 1,
      },
    });

    return jsonResponse(
      {
        attribute,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(409, "Attribute name must be unique per user.");
    }

    throw error;
  }
}
