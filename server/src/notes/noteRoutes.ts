import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../auth/authMiddleware.js";
import { Note } from "./noteModel.js";
import { parseNoteInput } from "./noteValidation.js";

export const noteRoutes = Router();

const sortOptions = {
  recent: { createdAt: -1 },
  popular: { upvotes: -1, createdAt: -1 },
  downloads: { downloadsCount: -1, createdAt: -1 },
  title: { title: 1 },
} as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

noteRoutes.get("/", async (request, response, next) => {
  try {
    const search = typeof request.query.search === "string" ? request.query.search.trim() : "";
    const subject = typeof request.query.subject === "string" ? request.query.subject.trim() : "";
    const courseCode = typeof request.query.courseCode === "string" ? request.query.courseCode.trim() : "";
    const sortBy = typeof request.query.sortBy === "string" && Object.hasOwn(sortOptions, request.query.sortBy)
      ? request.query.sortBy as keyof typeof sortOptions
      : "recent";
    const filters: Record<string, unknown> = {};

    if (subject && subject !== "All") filters.subject = subject;
    if (courseCode) filters.courseCode = { $regex: escapeRegex(courseCode), $options: "i" };
    if (search) {
      const term = { $regex: escapeRegex(search), $options: "i" };
      filters.$or = [
        { title: term },
        { description: term },
        { subject: term },
        { courseCode: term },
        { tags: term },
      ];
    }

    const notes = await Note.find(filters).sort(sortOptions[sortBy]).lean();
    response.json({ data: notes });
  } catch (error) {
    next(error);
  }
});

noteRoutes.get("/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid note ID." });
      return;
    }

    const note = await Note.findById(request.params.id).lean();
    if (!note) {
      response.status(404).json({ error: "Study note not found." });
      return;
    }
    response.json({ data: note });
  } catch (error) {
    next(error);
  }
});

noteRoutes.post("/", requireAuth, async (request, response, next) => {
  try {
    const parsed = parseNoteInput(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Please correct the form fields.", details: parsed.error.flatten().fieldErrors });
      return;
    }

    const note = await Note.create({
      ...parsed.data,
      authorId: request.authUser!.id,
      authorName: request.authUser!.name,
      authorUniversity: parsed.data.university,
      upvotes: 0,
      downvotes: 0,
      downloadsCount: 0,
      commentsCount: 0,
    });
    response.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
});

noteRoutes.post("/:id/download", requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid note ID." });
      return;
    }

    const note = await Note.findOneAndUpdate(
      { _id: request.params.id, fileUrl: { $ne: "" } },
      { $inc: { downloadsCount: 1 } },
      { new: true, projection: { downloadsCount: 1 } },
    ).lean();
    if (!note) {
      const exists = await Note.exists({ _id: request.params.id });
      response.status(exists ? 400 : 404).json({
        error: exists ? "This note has no file to download." : "Study note not found.",
      });
      return;
    }

    response.json({ data: { downloadsCount: note.downloadsCount } });
  } catch (error) {
    next(error);
  }
});

noteRoutes.put("/:id", requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid note ID." });
      return;
    }

    const parsed = parseNoteInput(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Please correct the form fields.", details: parsed.error.flatten().fieldErrors });
      return;
    }

    const note = await Note.findOneAndUpdate(
      { _id: request.params.id, authorId: request.authUser!.id },
      { $set: parsed.data },
      { new: true, runValidators: true },
    );
    if (!note) {
      const exists = await Note.exists({ _id: request.params.id });
      response.status(exists ? 403 : 404).json({
        error: exists ? "You can only edit notes you shared." : "Study note not found.",
      });
      return;
    }
    response.json({ data: note });
  } catch (error) {
    next(error);
  }
});

noteRoutes.delete("/:id", requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid note ID." });
      return;
    }

    const note = await Note.findOneAndDelete({ _id: request.params.id, authorId: request.authUser!.id });
    if (!note) {
      const exists = await Note.exists({ _id: request.params.id });
      response.status(exists ? 403 : 404).json({
        error: exists ? "You can only delete notes you shared." : "Study note not found.",
      });
      return;
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});
