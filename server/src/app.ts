import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { noteRoutes } from "./notes/noteRoutes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "database unavailable",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.use("/api/notes", noteRoutes);

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API route not found." });
});

if (process.env.NODE_ENV === "production") {
  const clientBuild = resolve(dirname(fileURLToPath(import.meta.url)), "../../client/dist");
  app.use(express.static(clientBuild, { index: false, maxAge: "1h" }));
  app.get("*", (_request, response, next) => {
    response.sendFile(resolve(clientBuild, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  console.error("API request failed:", error);
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: "Request body must contain valid JSON." });
    return;
  }
  response.status(500).json({ error: "The request could not be completed. Please try again." });
};

app.use(errorHandler);
