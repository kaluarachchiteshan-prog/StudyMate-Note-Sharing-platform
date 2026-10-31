import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../auth/authMiddleware.js";
import { User } from "../auth/userModel.js";
import { StudyGroup } from "./studyGroupModel.js";
import { StudyGroupMessage } from "./studyGroupMessageModel.js";
import { parseStudyGroupMessage } from "./studyGroupMessageValidation.js";
import { StudyGroupTask } from "./studyGroupTaskModel.js";
import { parseStudyGroupTaskInput, parseStudyGroupTaskStatus } from "./studyGroupTaskValidation.js";
import { parseStudyGroupInput } from "./studyGroupValidation.js";

export const studyGroupRoutes = Router();

studyGroupRoutes.get("/", async (_request, response, next) => {
  try {
    const groups = await StudyGroup.find().sort({ createdAt: -1 }).lean();
    response.json({ data: groups });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.post("/", requireAuth, async (request, response, next) => {
  try {
    const parsed = parseStudyGroupInput(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Please correct the group details.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const creatorId = request.authUser!.id;
    const group = await StudyGroup.create({
      ...parsed.data,
      creatorId,
      creatorName: request.authUser!.name,
      memberIds: [creatorId],
    });
    response.status(201).json({ data: group });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.get("/:id", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const group = await StudyGroup.findById(id).lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (!group.memberIds.includes(request.authUser!.id)) {
      response.status(403).json({ error: "Join this study group to view its members and discussion." });
      return;
    }

    const members = await User.find({ _id: { $in: group.memberIds } }).select("name").lean();
    response.json({
      data: {
        ...group,
        members: members.map((member) => ({ id: member._id.toString(), name: member.name })),
      },
    });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.get("/:id/messages", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const group = await StudyGroup.findById(id).select("memberIds").lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (!group.memberIds.includes(request.authUser!.id)) {
      response.status(403).json({ error: "Join this study group to view its discussion." });
      return;
    }

    const messages = await StudyGroupMessage.find({ groupId: id }).sort({ createdAt: 1 }).limit(200).lean();
    response.json({ data: messages });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.post("/:id/messages", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const parsed = parseStudyGroupMessage(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Enter a message of up to 1000 characters.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const group = await StudyGroup.findById(id).select("memberIds").lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (!group.memberIds.includes(request.authUser!.id)) {
      response.status(403).json({ error: "Join this study group to post in its discussion." });
      return;
    }

    const message = await StudyGroupMessage.create({
      groupId: id,
      authorId: request.authUser!.id,
      authorName: request.authUser!.name,
      body: parsed.data.body,
    });
    response.status(201).json({ data: message });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.get("/:id/tasks", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const group = await StudyGroup.findById(id).select("memberIds").lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (!group.memberIds.includes(request.authUser!.id)) {
      response.status(403).json({ error: "Join this study group to view its tasks." });
      return;
    }

    const tasks = await StudyGroupTask.find({ groupId: id }).sort({ isComplete: 1, dueDate: 1, createdAt: -1 }).lean();
    response.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.post("/:id/tasks", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const parsed = parseStudyGroupTaskInput(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Enter a task title and a valid optional due date.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const group = await StudyGroup.findById(id).select("memberIds").lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (!group.memberIds.includes(request.authUser!.id)) {
      response.status(403).json({ error: "Join this study group to add tasks." });
      return;
    }

    const task = await StudyGroupTask.create({
      groupId: id,
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ?? null,
      createdBy: request.authUser!.id,
      createdByName: request.authUser!.name,
    });
    response.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.patch("/:id/tasks/:taskId", requireAuth, async (request, response, next) => {
  try {
    const { id, taskId } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)
      || typeof taskId !== "string" || !mongoose.isValidObjectId(taskId)) {
      response.status(400).json({ error: "Invalid study group or task ID." });
      return;
    }

    const parsed = parseStudyGroupTaskStatus(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Choose whether the task is complete." });
      return;
    }

    const group = await StudyGroup.findById(id).select("memberIds").lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (!group.memberIds.includes(request.authUser!.id)) {
      response.status(403).json({ error: "Join this study group to update tasks." });
      return;
    }

    const task = await StudyGroupTask.findOneAndUpdate(
      { _id: taskId, groupId: id },
      { $set: { isComplete: parsed.data.isComplete } },
      { new: true, runValidators: true },
    ).lean();
    if (!task) {
      response.status(404).json({ error: "Study task not found." });
      return;
    }
    response.json({ data: task });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.post("/:id/join", requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const group = await StudyGroup.findOneAndUpdate(
      {
        _id: request.params.id,
        memberIds: { $ne: request.authUser!.id },
        $expr: { $lt: [{ $size: "$memberIds" }, "$maxMembers"] },
      },
      { $addToSet: { memberIds: request.authUser!.id } },
      { new: true },
    ).lean();

    if (group) {
      response.json({ data: group });
      return;
    }

    const existing = await StudyGroup.findById(request.params.id).lean();
    if (!existing) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    if (existing.memberIds.includes(request.authUser!.id)) {
      response.json({ data: existing });
      return;
    }
    response.status(409).json({ error: "This study group is full." });
  } catch (error) {
    next(error);
  }
});

studyGroupRoutes.delete("/:id/membership", requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid study group ID." });
      return;
    }

    const group = await StudyGroup.findByIdAndUpdate(
      request.params.id,
      { $pull: { memberIds: request.authUser!.id } },
      { new: true },
    ).lean();
    if (!group) {
      response.status(404).json({ error: "Study group not found." });
      return;
    }
    response.json({ data: group });
  } catch (error) {
    next(error);
  }
});
