import assert from "node:assert/strict";
import test from "node:test";
import { parseNoteRequestInput, parseNoteRequestStatus } from "./noteRequestValidation.js";

const validRequest = {
  title: "EC4307 lecture notes for week five",
  subject: "Web Application Development",
  courseCode: "ec4307",
  details: "Looking for notes that cover REST APIs and Express middleware.",
};

test("validates note requests and normalizes course codes", () => {
  const result = parseNoteRequestInput(validRequest);

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.courseCode, "EC4307");
});

test("rejects incomplete or unexpected note request data", () => {
  assert.equal(parseNoteRequestInput({ ...validRequest, details: "Need it" }).success, false);
  assert.equal(parseNoteRequestInput({ ...validRequest, requesterId: "spoofed" }).success, false);
  assert.equal(parseNoteRequestStatus({ status: "open" }).success, false);
  assert.equal(parseNoteRequestStatus({ status: "fulfilled", requesterId: "spoofed" }).success, false);
});
