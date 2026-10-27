import mongoose, { InferSchemaType } from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    subject: { type: String, required: true, trim: true, maxlength: 80 },
    courseCode: { type: String, required: true, trim: true, maxlength: 30 },
    university: { type: String, required: true, trim: true, maxlength: 120 },
    tags: { type: [String], default: [], validate: (tags: string[]) => tags.length <= 10 },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "", maxlength: 180 },
    fileSize: { type: String, default: "", maxlength: 30 },
    fileType: { type: String, enum: ["pdf", "doc", "text"], default: "pdf" },
    previewText: { type: String, default: "", maxlength: 10000 },
    authorId: { type: String, default: "local-demo-user" },
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    authorAvatar: { type: String, default: "" },
    authorUniversity: { type: String, required: true, trim: true, maxlength: 120 },
    upvotes: { type: Number, default: 0, min: 0 },
    downvotes: { type: Number, default: 0, min: 0 },
    downloadsCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

noteSchema.index({ createdAt: -1 });
noteSchema.index({ title: "text", description: "text", subject: "text", courseCode: "text", tags: "text" });

export type NoteDocument = InferSchemaType<typeof noteSchema>;

export const Note = mongoose.model("Note", noteSchema);
