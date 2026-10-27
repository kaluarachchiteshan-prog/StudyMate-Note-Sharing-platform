import { z } from "zod";

const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, {
    message: "File URL must start with http:// or https://",
  })
  .default("");

export const noteInputSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(1000),
    subject: z.string().trim().min(2).max(80),
    courseCode: z.string().trim().min(2).max(30),
    university: z.string().trim().min(2).max(120),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
    fileUrl: optionalHttpUrl,
    fileName: z.string().trim().max(180).default(""),
    fileSize: z.string().trim().max(30).default(""),
    fileType: z.enum(["pdf", "doc", "text"]).default("pdf"),
    previewText: z.string().trim().max(10000).default(""),
  })
  .strict();

export type NoteInput = z.infer<typeof noteInputSchema>;

export function parseNoteInput(value: unknown) {
  return noteInputSchema.safeParse(value);
}
