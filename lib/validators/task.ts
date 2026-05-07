import { z } from "zod";

export const taskKindSchema = z.enum(["RECURRING", "TODO", "HABIT"]);
export const taskCadenceSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "ONCE"]);
export const recurringCadenceSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
export const habitModeSchema = z.enum([
  "POSITIVE_ONLY",
  "NEGATIVE_RESETS",
  "SCORE_BASED",
]);

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.");

const attributeIdSchema = z
  .string()
  .trim()
  .min(1, "Attribute is required.");

const normalizedDescriptionSchema = z
  .union([
    z.string().trim().transform((value) => (value.length > 0 ? value : null)),
    z.null(),
  ]);

export const createTaskSchema = z
  .object({
    attributeId: attributeIdSchema,
    projectId: z.string().min(1).optional(),
    title: titleSchema,
    description: normalizedDescriptionSchema.optional(),
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
    description: normalizedDescriptionSchema.optional(),
    cadence: recurringCadenceSchema.optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    habitMode: habitModeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field must be provided.",
  });

export const listTasksQuerySchema = z.object({
  search: z
    .union([z.string(), z.undefined()])
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : undefined;
    }),
  attributeId: z.string().min(1).optional(),
  taskKind: taskKindSchema.optional(),
  cadence: taskCadenceSchema.optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});
