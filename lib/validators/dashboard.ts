import { z } from "zod";

import { booleanParamSchema } from "@/lib/validators/common";

export const dashboardQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  categoryId: z.string().min(1).optional(),
  includeInactive: booleanParamSchema,
});
