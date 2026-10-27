import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";
import { seedNotesIfEmpty } from "./seedNotes.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studymate";

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.info("Connected to MongoDB.");
  await seedNotesIfEmpty();
  app.listen(port, "127.0.0.1", () => {
    console.info(`StudyMate API listening on http://127.0.0.1:${port}`);
  });
} catch (error) {
  console.error("Could not start the API. Check that MongoDB is running and MONGODB_URI is correct.", error);
  process.exitCode = 1;
}
