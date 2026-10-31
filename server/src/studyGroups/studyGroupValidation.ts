import { z } from "zod";

export const studyGroupInputSchema = z.object({
  name: z.string().trim().min(3).max(80),
  subject: z.string().trim().min(2).max(80),
  courseCode: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  description: z.string().trim().max(500).default(""),
  meetingSchedule: z.string().trim().max(120).default(""),
  maxMembers: z.number().int().min(2).max(30).default(8),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
}).strict();

export type StudyGroupInput = z.infer<typeof studyGroupInputSchema>;

export function parseStudyGroupInput(value: unknown) {
  return studyGroupInputSchema.safeParse(value);
}
