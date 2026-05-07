import { z } from "zod";

import { nameSchema } from "@/lib/validators/common";

export const createCategorySchema = z.object({
  name: nameSchema,
});

export const updateCategorySchema = z.object({
  name: nameSchema,
});

export const reorderCategoriesSchema = z.object({
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "At least one Habit List is required."),
});
