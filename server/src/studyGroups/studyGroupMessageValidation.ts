import { z } from "zod";

export const studyGroupMessageSchema = z.object({
  body: z.string().trim().min(1).max(1000),
}).strict();

export function parseStudyGroupMessage(value: unknown) {
  return studyGroupMessageSchema.safeParse(value);
}
