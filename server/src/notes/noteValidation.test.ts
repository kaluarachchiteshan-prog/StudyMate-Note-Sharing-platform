import assert from "node:assert/strict";
import test from "node:test";
import { parseNoteInput } from "./noteValidation.js";

const validNote = {
  title: "CS161 Graph Algorithms",
  description: "Study notes covering graph algorithms and worked examples.",
  subject: "Computer Science",
  courseCode: "CS161",
  university: "University of Moratuwa",
  tags: ["Graphs", "Algorithms"],
  fileUrl: "",
  fileName: "graphs.pdf",
  fileSize: "2 MB",
  fileType: "pdf",
  previewText: "Dijkstra's algorithm.",
};

test("accepts valid note data and trims user input", () => {
  const result = parseNoteInput({ ...validNote, title: "  CS161 Graph Algorithms  " });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.title, "CS161 Graph Algorithms");
});

test("rejects incomplete data and unsupported properties", () => {
  assert.equal(parseNoteInput({ ...validNote, title: "x" }).success, false);
  assert.equal(parseNoteInput({ ...validNote, admin: true }).success, false);
});

test("rejects unsafe file URL schemes and oversized tag lists", () => {
  assert.equal(parseNoteInput({ ...validNote, fileUrl: "javascript:alert(1)" }).success, false);
  assert.equal(parseNoteInput({ ...validNote, tags: Array(11).fill("tag") }).success, false);
});
