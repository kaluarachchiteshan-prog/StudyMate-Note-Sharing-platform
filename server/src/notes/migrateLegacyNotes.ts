import type { Types } from "mongoose";
import { Note } from "./noteModel.js";

type LegacyNote = {
  _id: Types.ObjectId;
  course?: unknown;
  subject?: unknown;
  university?: unknown;
  authorUniversity?: unknown;
  authorName?: unknown;
  description?: unknown;
  content?: unknown;
  file?: unknown;
  fileName?: unknown;
  fileType?: unknown;
  tags?: unknown;
};

function text(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : fallback;
}

function migrateNote(note: LegacyNote) {
  const course = text(note.course, "", 120);
  const university = text(note.university ?? note.authorUniversity, "University of Moratuwa", 120);
  const courseCode = course.split(/[·|–—]/, 1)[0].trim() || "GENERAL";
  const tags = Array.isArray(note.tags)
    ? note.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 10)
    : [];
  const fileType = note.fileType === "doc" || note.fileType === "text" ? note.fileType : "pdf";

  return {
    courseCode: courseCode.slice(0, 30),
    subject: text(note.subject, "General", 80),
    university,
    authorUniversity: university,
    authorName: text(note.authorName, "StudyMate Student", 80),
    description: text(note.description, "Shared course notes and study material.", 1000),
    previewText: text(note.content, "", 10000),
    fileUrl: text(note.file, "", 500),
    fileName: text(note.fileName, "", 180),
    fileType,
    tags,
    authorId: "local-demo-user",
    upvotes: 0,
    downvotes: 0,
    downloadsCount: 0,
    commentsCount: 0,
  };
}

export async function migrateLegacyNotes() {
  const legacyNotes = await Note.collection.find<LegacyNote>({
    courseCode: { $exists: false },
  }).toArray();

  for (const note of legacyNotes) {
    await Note.collection.updateOne(
      { _id: note._id },
      { $set: migrateNote(note) },
    );
  }

  if (legacyNotes.length > 0) {
    console.info(`Updated ${legacyNotes.length} existing notes to the current StudyMate schema.`);
  }
}
