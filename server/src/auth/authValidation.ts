import { z } from "zod";

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(128);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
}).strict();

export const loginSchema = z.object({
  email,
  password,
}).strict();
