import { jsonError, jsonResponse } from "@/lib/http";
import { bootstrapDefaultCategories } from "@/lib/categories";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return jsonError(401, "Authentication required.");
  }

  const result = await bootstrapDefaultCategories(session.user.id);

  return jsonResponse({
    categories: result.categories,
    createdNames: result.createdNames,
  });
}
