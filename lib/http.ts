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
