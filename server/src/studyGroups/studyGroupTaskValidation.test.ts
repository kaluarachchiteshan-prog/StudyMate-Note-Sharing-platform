import assert from "node:assert/strict";
import test from "node:test";
import { parseStudyGroupTaskInput, parseStudyGroupTaskStatus } from "./studyGroupTaskValidation.js";

test("validates study tasks and converts due dates", () => {
  const result = parseStudyGroupTaskInput({ title: "Review chapter two", dueDate: "2026-11-15" });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.dueDate?.toISOString(), "2026-11-15T23:59:59.999Z");
});

test("rejects invalid task titles, dates, and completion data", () => {
  assert.equal(parseStudyGroupTaskInput({ title: "No" }).success, false);
  assert.equal(parseStudyGroupTaskInput({ title: "Review chapter two", dueDate: "2026-02-30" }).success, false);
  assert.equal(parseStudyGroupTaskStatus({ isComplete: "yes" }).success, false);
});
