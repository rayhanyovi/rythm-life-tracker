import { jsonError, jsonResponse, validationErrorResponse } from "@/lib/http";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { updateCompletionSchema } from "@/lib/validators/completion";

type CompletionNoteRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: CompletionNoteRouteContext,
) {
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

  const result = updateCompletionSchema.safeParse(parsedBody);

  if (!result.success) {
    return validationErrorResponse(result.error);
  }

  const { id } = await context.params;
  const completion = await db.questCompletion.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!completion) {
    return jsonError(404, "Completion not found.");
  }

  const updatedCompletion = await db.questCompletion.update({
    where: { id: completion.id },
    data: {
      note: result.data.note ?? null,
    },
  });

  return jsonResponse({
    completion: updatedCompletion,
  });
}
