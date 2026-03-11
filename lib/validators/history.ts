import { z } from "zod";

import { questTypeSchema } from "@/lib/validators/quest";

export const historyQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  questId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  questType: questTypeSchema.optional(),
  cursor: z.string().min(1).optional(),
});
