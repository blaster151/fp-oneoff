import { describe, it, expect } from "vitest";
import { isoLaws, runLaws } from "../Witness";

describe("Isomorphism laws", () => {
  it("string-number isomorphism satisfies round-trip laws", () => {
    const eqString = (a: string, b: string) => a === b;
    const eqNumber = (a: number, b: number) => a === b;
    
    // Create a proper isomorphism: string <-> number via a fixed mapping
    const stringToNum = new Map([["a", 1], ["b", 2], ["c", 3]]);
    const numToString = new Map([[1, "a"], [2, "b"], [3, "c"]]);
    
    const iso = {
      to: (s: string) => stringToNum.get(s) ?? 0,
      from: (n: number) => numToString.get(n) ?? ""
    };
    
    const laws = isoLaws(eqString, eqNumber, iso);
    const result = runLaws(laws, {
      samplesA: ["a", "b", "c"],
      samplesB: [1, 2, 3]
    });
    
    expect(result.ok).toBe(true);
  });
  
  it("failing isomorphism shows witness", () => {
    const eqString = (a: string, b: string) => a === b;
    const eqNumber = (a: number, b: number) => a === b;
    
    // Broken isomorphism: to and from don't compose to identity
    const brokenIso = {
      to: (s: string) => s.length,
      from: (n: number) => "y".repeat(n) // Should be "x" to match to
    };
    
    const laws = isoLaws(eqString, eqNumber, brokenIso);
    const result = runLaws(laws, {
      samplesA: ["a"],
      samplesB: [1]
    });
    
    expect(result.ok).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
    expect(result.failures[0].witness).toBeDefined();
  });
});