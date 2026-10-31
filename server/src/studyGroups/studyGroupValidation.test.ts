import assert from "node:assert/strict";
import test from "node:test";
import { parseStudyGroupInput } from "./studyGroupValidation.js";

const validGroup = {
  name: "Web Development Study Circle",
  subject: "Web Development",
  courseCode: "ec4307",
  description: "Weekly revision and project support.",
  meetingSchedule: "Wednesdays at 6 PM",
  maxMembers: 8,
  tags: ["Revision", "Projects"],
};

test("validates study group details and normalizes course codes", () => {
  const result = parseStudyGroupInput(validGroup);

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.courseCode, "EC4307");
});

test("rejects invalid group details and unexpected fields", () => {
  assert.equal(parseStudyGroupInput({ ...validGroup, maxMembers: 31 }).success, false);
  assert.equal(parseStudyGroupInput({ ...validGroup, tags: Array(11).fill("tag") }).success, false);
  assert.equal(parseStudyGroupInput({ ...validGroup, creatorId: "spoofed" }).success, false);
});
