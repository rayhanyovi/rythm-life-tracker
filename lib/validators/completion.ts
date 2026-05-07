import { z } from "zod";

import { normalizedNoteSchema } from "@/lib/validators/common";

export const upsertCurrentCompletionSchema = z.object({
  note: normalizedNoteSchema.optional(),
});

export const updateCompletionSchema = z.object({
  note: normalizedNoteSchema,
});
