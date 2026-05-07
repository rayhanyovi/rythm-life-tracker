import { Prisma } from "@prisma/client";

import { jsonError, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { updateAttributeSchema } from "@/lib/validators/attribute";

type AttributeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: AttributeRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const result = updateAttributeSchema.safeParse(parsed.data);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const existingAttribute = await db.attribute.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingAttribute) {
    return jsonError(404, "Attribute not found.");
  }

  try {
    const attribute = await db.attribute.update({
      where: { id: existingAttribute.id },
      data: {
        name: result.data.name,
      },
    });

    return jsonResponse({
      attribute,
    });
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

export async function DELETE(request: Request, context: AttributeRouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const { id } = await context.params;
  const existingAttribute = await db.attribute.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingAttribute) {
    return jsonError(404, "Attribute not found.");
  }

  const taskCount = await db.task.count({
    where: {
      userId: session.user.id,
      attributeId: existingAttribute.id,
    },
  });

  if (taskCount > 0) {
    return jsonError(
      409,
      "Attribute cannot be deleted while tasks still use it.",
    );
  }

  await db.attribute.delete({
    where: { id: existingAttribute.id },
  });

  return new Response(null, { status: 204 });
}
