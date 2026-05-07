import { z } from "zod";

import {
  atLeastOneField,
  booleanParamSchema,
  nameSchema,
  normalizedDescriptionSchema,
  searchParamSchema,
  titleSchema,
} from "@/lib/validators/common";

export const taskKindSchema = z.enum(["RECURRING", "TODO", "HABIT"]);
export const taskCadenceSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "ONCE"]);
export const recurringCadenceSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
export const habitModeSchema = z.enum([
  "POSITIVE_ONLY",
  "NEGATIVE_RESETS",
  "SCORE_BASED",
]);

const attributeIdSchema = nameSchema.describe("Attribute is required.");

export const createTaskSchema = z
  .object({
    attributeId: attributeIdSchema,
    projectId: z.string().min(1).optional(),
    title: titleSchema,
    description: normalizedDescriptionSchema,
    taskKind: taskKindSchema,
    cadence: recurringCadenceSchema.optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    habitMode: habitModeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.taskKind === "RECURRING" && !data.cadence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cadence is required for RECURRING tasks.",
        path: ["cadence"],
      });
    }

    if (data.taskKind === "HABIT" && !data.cadence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cadence is required for HABIT tasks.",
        path: ["cadence"],
      });
    }

    if (data.taskKind === "HABIT" && !data.habitMode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "habitMode is required for HABIT tasks.",
        path: ["habitMode"],
      });
    }
  });

export const updateTaskSchema = z
  .object({
    attributeId: attributeIdSchema.optional(),
    projectId: z.string().min(1).optional(),
    title: titleSchema.optional(),
    description: normalizedDescriptionSchema,
    cadence: recurringCadenceSchema.optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    habitMode: habitModeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(atLeastOneField, { message: "At least one field must be provided." });

export const listTasksQuerySchema = z.object({
  search: searchParamSchema,
  attributeId: z.string().min(1).optional(),
  taskKind: taskKindSchema.optional(),
  cadence: taskCadenceSchema.optional(),
  includeInactive: booleanParamSchema,
});
