import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../auth/authMiddleware.js";
import { NoteRequest } from "./noteRequestModel.js";
import { parseNoteRequestInput, parseNoteRequestStatus } from "./noteRequestValidation.js";

export const noteRequestRoutes = Router();

noteRequestRoutes.get("/", async (request, response, next) => {
  try {
    const status = request.query.status === "fulfilled" ? "fulfilled" : "open";
    const requests = await NoteRequest.find({ status }).sort({ createdAt: -1 }).lean();
    response.json({ data: requests });
  } catch (error) {
    next(error);
  }
});

noteRequestRoutes.post("/", requireAuth, async (request, response, next) => {
  try {
    const parsed = parseNoteRequestInput(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Please correct the note request details.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const noteRequest = await NoteRequest.create({
      ...parsed.data,
      requesterId: request.authUser!.id,
      requesterName: request.authUser!.name,
    });
    response.status(201).json({ data: noteRequest });
  } catch (error) {
    next(error);
  }
});

noteRequestRoutes.patch("/:id/status", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid note request ID." });
      return;
    }

    const parsed = parseNoteRequestStatus(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid note request status." });
      return;
    }

    const noteRequest = await NoteRequest.findOneAndUpdate(
      { _id: id, requesterId: request.authUser!.id, status: "open" },
      { $set: { status: parsed.data.status } },
      { new: true, runValidators: true },
    ).lean();
    if (!noteRequest) {
      const existing = await NoteRequest.exists({ _id: id });
      response.status(existing ? 403 : 404).json({
        error: existing ? "Only the requester can mark this request fulfilled." : "Note request not found.",
      });
      return;
    }
    response.json({ data: noteRequest });
  } catch (error) {
    next(error);
  }
});
