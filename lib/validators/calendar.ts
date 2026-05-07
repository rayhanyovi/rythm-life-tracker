import { z } from "zod";

import { upcomingCadenceSchema } from "@/lib/validators/upcoming";

export const calendarQuerySchema = z.object({
  attributeId: z.string().min(1).optional(),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  cadence: upcomingCadenceSchema.optional(),
});
