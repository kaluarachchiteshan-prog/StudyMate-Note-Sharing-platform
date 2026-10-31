import { z } from "zod";

export const noteRequestInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subject: z.string().trim().min(2).max(80),
  courseCode: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  details: z.string().trim().min(10).max(500),
}).strict();

export const noteRequestStatusSchema = z.object({
  status: z.literal("fulfilled"),
}).strict();

export function parseNoteRequestInput(value: unknown) {
  return noteRequestInputSchema.safeParse(value);
}

export function parseNoteRequestStatus(value: unknown) {
  return noteRequestStatusSchema.safeParse(value);
}
