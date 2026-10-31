import mongoose, { InferSchemaType } from "mongoose";

const studyGroupTaskSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyGroup", required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    dueDate: { type: Date, default: null },
    isComplete: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
    createdByName: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

studyGroupTaskSchema.index({ groupId: 1, isComplete: 1, dueDate: 1 });

export type StudyGroupTaskDocument = InferSchemaType<typeof studyGroupTaskSchema>;

export const StudyGroupTask = mongoose.model("StudyGroupTask", studyGroupTaskSchema);
