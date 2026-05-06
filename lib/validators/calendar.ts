import { z } from "zod";

import { upcomingQuestTypeSchema } from "@/lib/validators/upcoming";

export const calendarQuerySchema = z.object({
  categoryId: z.string().min(1).optional(),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  questType: upcomingQuestTypeSchema.optional(),
});
