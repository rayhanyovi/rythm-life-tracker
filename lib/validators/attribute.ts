import { z } from "zod";

const attributeNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.");

export const createAttributeSchema = z.object({
  name: attributeNameSchema,
});

export const updateAttributeSchema = z.object({
  name: attributeNameSchema,
});

export const reorderAttributesSchema = z.object({
  attributeIds: z
    .array(z.string().min(1))
    .min(1, "At least one Attribute is required."),
});
