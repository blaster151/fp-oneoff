import { describe, it, expect, beforeEach } from "vitest";
import { registerLawful, clearLawful, allLawful, runAll } from "../registry";
import { lawfulMonoid } from "../Monoid";
import { isoLaws, runLaws } from "../Witness";

describe("Law Registry Extensions", () => {
  beforeEach(() => {
    clearLawful();
  });

  it("can register and run custom monoid laws", () => {
    // Register a custom monoid
    const eqBool = (a: boolean, b: boolean) => a === b;
    const AndMonoid = { empty: true, concat: (a: boolean, b: boolean) => a && b };
    const pack = lawfulMonoid("Monoid/boolean/and", eqBool, AndMonoid, [true, false]);
    
    registerLawful(pack);
    
    expect(allLawful()).toHaveLength(1);
    expect(allLawful()[0].tag).toBe("Monoid/boolean/and");
    
    const report = runAll();
    expect(report).toHaveLength(1);
    expect(report[0].ok).toBe(true);
  });

  it("can register and run custom isomorphism laws", () => {
    // Register a custom isomorphism
    const eqString = (a: string, b: string) => a === b;
    const eqNumber = (a: number, b: number) => a === b;
    
    const stringToNum = new Map([["a", 1], ["b", 2], ["c", 3]]);
    const numToString = new Map([[1, "a"], [2, "b"], [3, "c"]]);
    
    const iso = {
      to: (s: string) => stringToNum.get(s) ?? 0,
      from: (n: number) => numToString.get(n) ?? ""
    };
    
    const laws = isoLaws(eqString, eqNumber, iso);
    const pack = {
      tag: "Iso/string-number/custom",
      eq: eqString,
      struct: iso,
      laws,
      run: () => runLaws(laws, {
        samplesA: ["a", "b", "c"],
        samplesB: [1, 2, 3]
      })
    };
    
    registerLawful(pack);
    
    expect(allLawful()).toHaveLength(1);
    expect(allLawful()[0].tag).toBe("Iso/string-number/custom");
    
    const report = runAll();
    expect(report).toHaveLength(1);
    expect(report[0].ok).toBe(true);
  });

  it("can register multiple packs and run them all", () => {
    // Register multiple packs
    const eqNum = (a: number, b: number) => a === b;
    const Sum = { empty: 0, concat: (x: number, y: number) => x + y };
    const Product = { empty: 1, concat: (x: number, y: number) => x * y };
    
    registerLawful(lawfulMonoid("Monoid/number/sum", eqNum, Sum, [0, 1, 2]));
    registerLawful(lawfulMonoid("Monoid/number/product", eqNum, Product, [1, 2, 3]));
    
    expect(allLawful()).toHaveLength(2);
    
    const report = runAll();
    expect(report).toHaveLength(2);
    expect(report.every(r => r.ok)).toBe(true);
  });

  it("can detect failing laws", () => {
    // Register a broken monoid (not associative)
    const eqNum = (a: number, b: number) => a === b;
    const BrokenMonoid = { 
      empty: 0, 
      concat: (x: number, y: number) => x + y + 1 // Not associative!
    };
    
    const pack = lawfulMonoid("Monoid/number/broken", eqNum, BrokenMonoid, [1, 2, 3]);
    registerLawful(pack);
    
    const report = runAll();
    expect(report).toHaveLength(1);
    expect(report[0].ok).toBe(false);
    expect(report[0].failures).toBeDefined();
    expect(report[0].failures!.length).toBeGreaterThan(0);
  });

  it("can clear and re-register packs", () => {
    // Register a pack
    const eqNum = (a: number, b: number) => a === b;
    const Sum = { empty: 0, concat: (x: number, y: number) => x + y };
    registerLawful(lawfulMonoid("Monoid/number/sum", eqNum, Sum, [0, 1, 2]));
    
    expect(allLawful()).toHaveLength(1);
    
    // Clear
    clearLawful();
    expect(allLawful()).toHaveLength(0);
    
    // Re-register
    registerLawful(lawfulMonoid("Monoid/number/sum", eqNum, Sum, [0, 1, 2]));
    expect(allLawful()).toHaveLength(1);
  });
});