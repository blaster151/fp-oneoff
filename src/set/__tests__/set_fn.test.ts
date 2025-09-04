import { describe, it, expect } from "vitest";
import { mkFiniteSet } from "../Set";
import { id, comp, equalByGraph } from "../Fn";

describe("Set & Fn basics", () => {
  const Nat5 = mkFiniteSet([0,1,2,3,4], (a,b)=>a===b);
  const Nat5x2 = mkFiniteSet([0,1,2,3,4].map(n=>n*2), (a,b)=>a===b);

  it("image/preimage sanity via composition", () => {
    const f = { dom: Nat5, cod: Nat5x2, f:(n:number)=>n*2 };
    const g = { dom: Nat5x2, cod: Nat5, f:(n:number)=>n/2|0 };
    const idN = id(Nat5);
    const gf = comp(g as any, f as any);
    expect(equalByGraph(gf as any, idN)).toBe(true);
  });
});