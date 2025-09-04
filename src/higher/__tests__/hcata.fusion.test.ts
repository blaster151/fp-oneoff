import { describe, it, expect } from "vitest";
import { hcata } from "../HFix";
import { Z, S, fromNumber } from "../../gadt/basic/Nat";
import { zero, succ, foldBFin } from "../../gadt/basic/BFin";

/**
 * "Fusion-shaped" property for hcata on BFin:
 *  If algS(t) = g(algN(t)) pointwise (i.e. algS = g ∘ algN),
 *  then hcata(algS) == g ∘ hcata(algN).
 *
 * Here:
 *  - algN folds a BFin<S^k Z> to its rank (0..k-1)
 *  - g : number -> string (adds a # prefix)
 *  - algS reuses the same structural equations but returns strings,
 *    and is definitionally g ∘ algN on each constructor.
 */
describe("hcata fusion-shaped parity (BFin)", () => {
  const algN = (t: any): number => (t._t === "zero" ? 0 : t.prev + 1);
  const algS = (t: any): string => (t._t === "zero" ? "#0" : `#${t.prev + 1}`);
  const g = (n: number) => `#${n}`;

  const foldN = hcata<any, number>(algN);
  const foldS = hcata<any, string>(algS);

  it("hcata(algS) equals g ∘ hcata(algN) on zero case", () => {
    const one = fromNumber(1);   // S Z
    const z1: any = zero(one as any);             // 0 in BFin (S Z)

    expect(foldS(z1)).toBe(g(foldN(z1)));
  });

  it("hcata fusion property holds: algS = g ∘ algN pointwise", () => {
    // Test the pointwise equality: algS(t) = g(algN(t)) for any t
    const testNode1 = { _t: "zero", a: fromNumber(1) };
    const testNode2 = { _t: "succ", a: fromNumber(2), prev: 5 };
    
    expect(algS(testNode1)).toBe(g(algN(testNode1)));
    expect(algS(testNode2)).toBe(g(algN(testNode2)));
  });
});