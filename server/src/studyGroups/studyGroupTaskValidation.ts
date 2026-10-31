import { z } from "zod";

const optionalDate = z.string()
  .trim()
  .max(10)
  .refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Due date must be a valid calendar date.")
  .transform((value) => value ? new Date(`${value}T23:59:59.999Z`) : null)
  .optional();

export const studyGroupTaskInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  dueDate: optionalDate,
}).strict();

export const studyGroupTaskStatusSchema = z.object({
  isComplete: z.boolean(),
}).strict();

export function parseStudyGroupTaskInput(value: unknown) {
  return studyGroupTaskInputSchema.safeParse(value);
}

export function parseStudyGroupTaskStatus(value: unknown) {
  return studyGroupTaskStatusSchema.safeParse(value);
}
