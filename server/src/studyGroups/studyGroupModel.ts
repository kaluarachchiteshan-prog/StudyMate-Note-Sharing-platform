import mongoose, { InferSchemaType } from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    subject: { type: String, required: true, trim: true, maxlength: 80 },
    courseCode: { type: String, required: true, trim: true, maxlength: 30 },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    meetingSchedule: { type: String, default: "", trim: true, maxlength: 120 },
    creatorId: { type: String, required: true },
    creatorName: { type: String, required: true, trim: true, maxlength: 80 },
    memberIds: { type: [String], default: [] },
    maxMembers: { type: Number, required: true, min: 2, max: 30, default: 8 },
    tags: { type: [String], default: [], validate: (tags: string[]) => tags.length <= 10 },
  },
  { timestamps: true },
);

studyGroupSchema.index({ createdAt: -1 });
studyGroupSchema.index({ courseCode: 1 });

export type StudyGroupDocument = InferSchemaType<typeof studyGroupSchema>;

export const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);
