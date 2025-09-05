import { describe, it, expect } from "vitest";
import { LawsExamples } from "../examples";

describe("Laws Framework Examples", () => {
  it("all examples pass their respective laws", () => {
    const results = LawsExamples.runAllExamples();
    const allPassed = results.every(r => r.ok);
    expect(allPassed).toBe(true);
  });
  
  it("ring multiplicative laws pass", () => {
    const result = LawsExamples.testRingMultiplicativeLaws();
    expect(result.ok).toBe(true);
  });
  
  it("divisibility poset laws pass", () => {
    const result = LawsExamples.testDivisibilityPoset();
    expect(result.ok).toBe(true);
  });
  
  it("CRT isomorphism laws pass", () => {
    const result = LawsExamples.testCRTIsomorphism();
    expect(result.ok).toBe(true);
  });
  
  it("powerset lattice laws pass", () => {
    const result = LawsExamples.testPowersetLattice();
    expect(result.ok).toBe(true);
  });
});