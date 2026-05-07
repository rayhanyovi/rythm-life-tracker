import { z } from "zod";

export const upcomingCadenceSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);

export const upcomingQuerySchema = z.object({
  attributeId: z.string().min(1).optional(),
  horizon: z
    .enum(["7", "14", "30"])
    .optional()
    .transform((value) => Number(value ?? "7")),
  cadence: upcomingCadenceSchema.optional(),
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
