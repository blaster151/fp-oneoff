import { describe, it, expect } from "vitest";
import { powersetCPO, lfpOmega, isScottContinuous, cpoFromPoset } from "../Domain";
import { Poset } from "../Poset";

/** Example: dependency-closure on subsets (monotone + Scott-continuous); lfp reaches closure. */
describe("CPO & Kleene lfpω on powerset", () => {
  const U = ["a","b","c"] as const;
  const X = powersetCPO(U as unknown as string[], (x,y)=>x===y);

  // f(S) adds 'b' if 'a' in S; adds 'c' if 'b' in S
  const f = (S: string[]) => {
    const out = S.slice();
    if (S.includes("a") && !out.includes("b")) out.push("b");
    if (S.includes("b") && !out.includes("c")) out.push("c");
    return out;
  };

  it("Scott-continuous (finite chain check) and lfpω stabilizes", () => {
    const M = { source: X, target: X, f };
    expect(isScottContinuous(M)).toBe(true);
    const fix = lfpOmega(X, f);
    // starting at ⊥=∅, f^ω(⊥)=∅ since 'a' never appears; but if we seed 'a' then closure is U
    expect(X.eq(fix, [])).toBe(true);

    const g = (S: string[]) => (S.includes("a") ? ["a","b","c"] : S);
    const Mg = { source: X, target: X, f: g };
    expect(isScottContinuous(Mg)).toBe(true);
    expect(X.eq(lfpOmega(X, g), [])).toBe(true);
  });
});

/** Example: a finite chain CPO built from a custom poset. */
describe("Generic finite CPO via cpoFromPoset", () => {
  const E = [0,1,2,3];
  const P: Poset<number> = { elems: E, leq: (a,b)=>a<=b, eq:(a,b)=>a===b };
  const C = cpoFromPoset(P, 0);

  it("lfpω on monotone f(n)=min(n+1,3) is 3", () => {
    const f = (n:number)=> Math.min(n+1, 3);
    const fix = C.bot === 0 ? (function(){ return (function step(x:number){ const nx=f(x); return nx===x?x:step(nx); })(0); })() : -1;
    expect(C.eq(lfpOmega(C, f), 3)).toBe(true);
  });
});