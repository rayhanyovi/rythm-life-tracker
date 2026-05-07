/**
 * Shared Zod schema primitives.
 * Import from here instead of copy-pasting across validator files.
 */
import { z } from "zod";

/** Non-empty trimmed string. Use for `title`, `name`, and similar required fields. */
export const trimmedStringSchema = z.string().trim().min(1);

/** Required title field with a human-readable error message. */
export const titleSchema = trimmedStringSchema.min(1, "Title is required.");

/** Required name field (attributes, categories, projects). */
export const nameSchema = trimmedStringSchema.min(1, "Name is required.");

/**
 * Optional description: trims the value and converts blank strings to `null`.
 * Accepts `string | null | undefined`. Always outputs `string | null`.
 */
export const normalizedDescriptionSchema = z
  .union([
    z.string().trim().transform((value) => (value.length > 0 ? value : null)),
    z.null(),
  ])
  .optional();

/**
 * Optional note field: trims the value and converts blank strings to `null`.
 * Accepts `string | null | undefined`. Always outputs `string | null`.
 */
export const normalizedNoteSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

/**
 * Optional search query param: trims and returns `undefined` for blank values.
 * Accepts `string | undefined`. Always outputs `string | undefined`.
 */
export const searchParamSchema = z
  .union([z.string(), z.undefined()])
  .transform((value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

/**
 * Boolean-from-string flag for query params (e.g. `?includeInactive=true`).
 * Accepts `"true" | "false" | undefined`. Always outputs `boolean`.
 */
export const booleanParamSchema = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

/**
 * `.refine()` predicate that ensures at least one field is provided in an
 * update schema. Use with `.refine(atLeastOneField, ...)`.
 */
export const atLeastOneField = (
  value: Record<string, unknown>,
): boolean => Object.values(value).some((field) => field !== undefined);
