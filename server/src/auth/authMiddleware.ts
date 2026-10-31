import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { Session } from "./sessionModel.js";
import { User } from "./userModel.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export function readSessionToken(request: Request) {
  const cookieHeader = request.get("cookie") || "";
  const sessionCookie = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith("studymate_session="));
  const token = sessionCookie?.slice("studymate_session=".length);
  return token && /^[0-9a-f]{64}$/.test(token) ? token : "";
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = readSessionToken(request);
  if (!token) {
    response.status(401).json({ error: "Please sign in to continue." });
    return;
  }

  try {
    const session = await Session.findOne({
      tokenHash: hashSessionToken(token),
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!session) {
      response.status(401).json({ error: "Your session has expired. Please sign in again." });
      return;
    }

    const user = await User.findById(session.userId).select("name email").lean();
    if (!user) {
      response.status(401).json({ error: "Your account is no longer available. Please sign in again." });
      return;
    }

    request.authUser = { id: user._id.toString(), name: user.name, email: user.email };
    next();
  } catch (error) {
    next(error);
  }
}
