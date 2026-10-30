import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import express, { Router, type Request } from "express";

export const uploadRoutes = Router();

const maxFileSize = 10 * 1024 * 1024;
const uploadDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../.data/uploads");
const allowedTypes = {
  ".pdf": "pdf",
  ".doc": "doc",
  ".docx": "doc",
  ".txt": "text",
} as const;

function decodeFileName(request: Request) {
  const encodedName = request.get("x-file-name");
  if (!encodedName) return "";
  try {
    return basename(decodeURIComponent(encodedName));
  } catch {
    return "";
  }
}

uploadRoutes.post(
  "/",
  express.raw({ type: "application/octet-stream", limit: maxFileSize }),
  async (request, response, next) => {
    const fileName = decodeFileName(request);
    const extension = extname(fileName).toLowerCase();
    const fileType = allowedTypes[extension as keyof typeof allowedTypes];
    const file = request.body;

    if (!Buffer.isBuffer(file) || file.length === 0) {
      response.status(400).json({ error: "Select a non-empty file to upload." });
      return;
    }
    if (!fileType) {
      response.status(415).json({ error: "Only PDF, Word, and text files can be uploaded." });
      return;
    }

    const safeBaseName = basename(fileName, extname(fileName)).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 170) || "note";
    const safeFileName = `${safeBaseName}${extension}`;
    const storedName = `${randomUUID()}-${safeFileName}`;

    try {
      await mkdir(uploadDirectory, { recursive: true });
      await writeFile(resolve(uploadDirectory, storedName), file, { flag: "wx" });
      const fileSize = `${(file.length / (1024 * 1024)).toFixed(1)} MB`;
      response.status(201).json({
        data: {
          url: `/api/uploads/${encodeURIComponent(storedName)}`,
          fileName: safeFileName,
          fileSize,
          fileType,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

uploadRoutes.get("/:fileName", async (request, response, next) => {
  const { fileName } = request.params;
  if (!/^[0-9a-f-]{36}-[A-Za-z0-9._-]{1,180}$/i.test(fileName)) {
    response.status(400).json({ error: "Invalid uploaded file name." });
    return;
  }

  try {
    const file = await readFile(resolve(uploadDirectory, fileName));
    response.attachment(fileName.slice(37)).send(file);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      response.status(404).json({ error: "Uploaded file not found." });
      return;
    }
    next(error);
  }
});
