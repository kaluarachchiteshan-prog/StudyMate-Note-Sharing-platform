import assert from "node:assert/strict";
import test from "node:test";
import { parseStudyGroupMessage } from "./studyGroupMessageValidation.js";

test("validates and trims study group messages", () => {
  const result = parseStudyGroupMessage({ body: "  Let's review chapter one.  " });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.body, "Let's review chapter one.");
});

test("rejects empty, oversized, and unexpected message data", () => {
  assert.equal(parseStudyGroupMessage({ body: "  " }).success, false);
  assert.equal(parseStudyGroupMessage({ body: "x".repeat(1001) }).success, false);
  assert.equal(parseStudyGroupMessage({ body: "Hello", authorId: "spoofed" }).success, false);
});
