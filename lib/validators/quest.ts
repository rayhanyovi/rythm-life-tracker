import { z } from "zod";

import {
  atLeastOneField,
  booleanParamSchema,
  normalizedDescriptionSchema,
  searchParamSchema,
  titleSchema,
} from "@/lib/validators/common";

export const questTypeSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "MAIN"]);

const categoryIdSchema = z.string().trim().min(1, "List is required.");

export const createQuestSchema = z.object({
  categoryId: categoryIdSchema,
  title: titleSchema,
  description: normalizedDescriptionSchema,
  questType: questTypeSchema,
  isActive: z.boolean().optional(),
});

export const updateQuestSchema = z
  .object({
    categoryId: categoryIdSchema.optional(),
    title: titleSchema.optional(),
    description: normalizedDescriptionSchema,
    questType: questTypeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(atLeastOneField, { message: "At least one field must be provided." });

export const listQuestsQuerySchema = z.object({
  search: searchParamSchema,
  categoryId: z.string().min(1).optional(),
  questType: questTypeSchema.optional(),
  includeInactive: booleanParamSchema,
});
