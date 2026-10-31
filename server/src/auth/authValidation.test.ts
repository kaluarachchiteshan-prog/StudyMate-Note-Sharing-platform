import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema, registerSchema } from "./authValidation.js";

test("validates and normalizes new account details", () => {
  const result = registerSchema.safeParse({
    name: "  Study Mate  ",
    email: "  USER@example.com ",
    password: "a secure password",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Study Mate");
    assert.equal(result.data.email, "user@example.com");
  }
});

test("rejects weak passwords and unexpected account fields", () => {
  assert.equal(registerSchema.safeParse({
    name: "Student",
    email: "student@example.com",
    password: "short",
  }).success, false);
  assert.equal(registerSchema.safeParse({
    name: "Student",
    email: "student@example.com",
    password: "a secure password",
    admin: true,
  }).success, false);
});

test("validates sign-in credentials", () => {
  assert.equal(loginSchema.safeParse({
    email: "student@example.com",
    password: "a secure password",
  }).success, true);
  assert.equal(loginSchema.safeParse({
    email: "not-an-email",
    password: "a secure password",
  }).success, false);
});
