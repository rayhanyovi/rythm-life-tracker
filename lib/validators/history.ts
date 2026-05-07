import { z } from "zod";

import { taskCadenceSchema } from "@/lib/validators/task";

export const historyQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  taskId: z.string().min(1).optional(),
  attributeId: z.string().min(1).optional(),
  cadence: taskCadenceSchema.optional(),
  cursor: z.string().min(1).optional(),
});
