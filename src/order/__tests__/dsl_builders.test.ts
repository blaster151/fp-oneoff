import { describe, it, expect } from "vitest";
import { posetFromPairs, subsetPoset, latticeFromPoset, completeFromBounded, Tiny } from "../dsl";

describe("posetFromPairs builds transitive/reflexive closures", () => {
  it("transitive closure works", () => {
    const P = posetFromPairs(["a","b","c"], [["a","b"], ["b","c"]], (x,y)=>x===y);
    expect(P.leq("a","c")).toBe(true);
    expect(P.leq("c","a")).toBe(false);
  });
});

describe("subsetPoset + latticeFromPoset yields boolean lattice (n=2)", () => {
  it("joins and meets work correctly", () => {
    const P = subsetPoset([0,1], (a,b)=>a===b);
    const L = latticeFromPoset(P);
    const C = completeFromBounded(L);
    const S0: number[] = [];
    const S1 = [0], S2 = [1], S12 = [0,1];
    // joins/meets
    expect(C.eq(C.sup([S1,S2]), S12)).toBe(true);
    expect(C.eq(C.inf([S1,S2]), S0)).toBe(true);
  });
});

describe("Tiny.threeChain", () => {
  it("creates a three-element chain", () => {
    const P = Tiny.threeChain();
    expect(P.leq(0,2)).toBe(true);
    expect(P.leq(2,0)).toBe(false);
  });
});