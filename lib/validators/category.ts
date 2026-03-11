import { z } from "zod";

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.");

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

export const updateCategorySchema = z.object({
  name: categoryNameSchema,
});

export const reorderCategoriesSchema = z.object({
  categoryIds: z.array(z.string().min(1)).min(1, "At least one category is required."),
});
