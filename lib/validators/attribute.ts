import { z } from "zod";

import { nameSchema } from "@/lib/validators/common";

export const createAttributeSchema = z.object({
  name: nameSchema,
});

export const updateAttributeSchema = z.object({
  name: nameSchema,
});

export const reorderAttributesSchema = z.object({
  attributeIds: z
    .array(z.string().min(1))
    .min(1, "At least one Attribute is required."),
});
