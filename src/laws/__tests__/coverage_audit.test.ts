import { describe, it, expect } from "vitest";

it("law coverage audit (mirrors CI)", async () => {
  const res = await import("../../../scripts/audit/law_coverage.ts"); // executes and may process.exit(1)
  expect(true).toBe(true); // if we got here, audit passed
});