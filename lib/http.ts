import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonResponse<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function jsonError(
  status: number,
  message: string,
  details?: unknown,
) {
  return jsonResponse(
    {
      error: message,
      details,
    },
    { status },
  );
}

export function validationErrorResponse(error: ZodError) {
  return jsonError(
    400,
    "Invalid request payload.",
    error.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      path: issue.path.join("."),
    })),
  );
}

/**
 * Parses the JSON body of a request.
 * Returns `{ ok: true, data }` on success, or `{ ok: false, response }` on
 * parse failure so callers can immediately return the error response.
 */
export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  try {
    const data: unknown = await request.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: jsonError(400, "Request body must be valid JSON."),
    };
  }
}

/**
 * Converts a known Prisma error into a Response, or returns null if the
 * error is not a Prisma error that we handle (so the caller can re-throw).
 *
 * Currently handled:
 *   P2003 — foreign key constraint failure → 400
 *   P2025 — record not found (delete/update) → 404
 */
export function handlePrismaError(error: unknown): Response | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (error.code === "P2003") {
    return jsonError(400, "References an invalid related record.");
  }

  if (error.code === "P2025") {
    return jsonError(404, "Record not found.");
  }

  return null;
}
