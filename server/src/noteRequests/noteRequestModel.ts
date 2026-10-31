import mongoose, { InferSchemaType } from "mongoose";

const noteRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 80 },
    courseCode: { type: String, required: true, trim: true, maxlength: 30 },
    details: { type: String, required: true, trim: true, maxlength: 500 },
    requesterId: { type: String, required: true },
    requesterName: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: ["open", "fulfilled"], default: "open" },
  },
  { timestamps: true },
);

noteRequestSchema.index({ status: 1, createdAt: -1 });
noteRequestSchema.index({ courseCode: 1, status: 1 });

export type NoteRequestDocument = InferSchemaType<typeof noteRequestSchema>;

export const NoteRequest = mongoose.model("NoteRequest", noteRequestSchema);
