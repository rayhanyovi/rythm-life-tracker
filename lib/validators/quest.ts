import { z } from "zod";

export const questTypeSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "MAIN"]);

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.");

const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "categoryId is required.");

const normalizedDescriptionSchema = z
  .union([
    z.string().trim().transform((value) => (value.length > 0 ? value : null)),
    z.null(),
  ]);

export const createQuestSchema = z.object({
  categoryId: categoryIdSchema,
  title: titleSchema,
  description: normalizedDescriptionSchema.optional(),
  questType: questTypeSchema,
  isActive: z.boolean().optional(),
});

export const updateQuestSchema = z
  .object({
    categoryId: categoryIdSchema.optional(),
    title: titleSchema.optional(),
    description: normalizedDescriptionSchema.optional(),
    questType: questTypeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field must be provided.",
  });

export const listQuestsQuerySchema = z.object({
  search: z
    .union([z.string(), z.undefined()])
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : undefined;
    }),
  categoryId: z.string().min(1).optional(),
  questType: questTypeSchema.optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});
