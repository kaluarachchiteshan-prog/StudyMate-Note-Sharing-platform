import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Router, type Response } from "express";
import { requireAuth, hashSessionToken, readSessionToken, type AuthUser } from "./authMiddleware.js";
import { Session } from "./sessionModel.js";
import { User } from "./userModel.js";
import { loginSchema, registerSchema } from "./authValidation.js";

const scrypt = promisify(scryptCallback);
const passwordKeyLength = 64;
const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;
const sessionCookieName = "studymate_session";

export const authRoutes = Router();

function publicUser(user: { _id: { toString(): string }; name: string; email: string }): AuthUser {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

function setSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDurationMs / 1000}${secure}`,
  );
}

function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

async function createSession(userId: unknown) {
  const token = randomBytes(32).toString("hex");
  await Session.create({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt: new Date(Date.now() + sessionDurationMs),
  });
  return token;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, passwordKeyLength) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex || !/^[0-9a-f]{128}$/.test(keyHex)) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, salt, passwordKeyLength) as Buffer;
  return timingSafeEqual(actual, expected);
}

authRoutes.get("/me", requireAuth, (request, response) => {
  response.json({ data: request.authUser });
});

authRoutes.post("/register", async (request, response, next) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Enter a valid name, email, and password with at least 8 characters." });
    return;
  }

  try {
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    });
    const token = await createSession(user._id);
    setSessionCookie(response, token);
    response.status(201).json({ data: publicUser(user) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      response.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    next(error);
  }
});

authRoutes.post("/login", async (request, response, next) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Enter a valid email and password." });
    return;
  }

  try {
    const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      response.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    const token = await createSession(user._id);
    setSessionCookie(response, token);
    response.json({ data: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/logout", async (request, response, next) => {
  try {
    const token = readSessionToken(request);
    if (token) {
      await Session.deleteOne({ tokenHash: hashSessionToken(token) });
    }
    clearSessionCookie(response);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});
