import mongoose, { InferSchemaType } from "mongoose";

const studyGroupMessageSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyGroup", required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

studyGroupMessageSchema.index({ groupId: 1, createdAt: 1 });

export type StudyGroupMessageDocument = InferSchemaType<typeof studyGroupMessageSchema>;

export const StudyGroupMessage = mongoose.model("StudyGroupMessage", studyGroupMessageSchema);
