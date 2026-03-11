import { z } from "zod";

const normalizedNoteSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  });

export const upsertCurrentCompletionSchema = z.object({
  note: normalizedNoteSchema.optional(),
});

export const updateCompletionSchema = z.object({
  note: normalizedNoteSchema,
});
