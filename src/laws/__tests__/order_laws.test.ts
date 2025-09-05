import { describe, it, expect } from "vitest";
import { posetLaws, completeLatticeLaws, lfpFixedPointLaw } from "../Order";
import { runLaws } from "../Witness";
import { powersetLattice } from "../../order/Lattice";

describe("Poset laws", () => {
  it("number poset satisfies poset axioms", () => {
    const P = {
      elems: [1, 2, 3, 4],
      leq: (a: number, b: number) => a <= b,
      eq: (a: number, b: number) => a === b
    };
    
    const laws = posetLaws(P);
    const result = runLaws(laws, { P });
    expect(result.ok).toBe(true);
  });
});

describe("Complete lattice laws", () => {
  it("powerset lattice satisfies lattice axioms", () => {
    const U = [1, 2, 3];
    const L = powersetLattice(U, (a, b) => a === b);
    
    const laws = completeLatticeLaws(L);
    const result = runLaws(laws, { L });
    expect(result.ok).toBe(true);
  });
});

describe("Fixed point laws", () => {
  it("lfp satisfies fixed point property", () => {
    const U = [1, 2, 3];
    const L = powersetLattice(U, (a, b) => a === b);
    
    // Simple monotone function: add 2 if 1 is present
    const f = (S: number[]) => {
      const out = S.slice();
      if (S.includes(1) && !out.includes(2)) out.push(2);
      return out;
    };
    
    const law = lfpFixedPointLaw(L, f);
    const result = runLaws([law], { L });
    expect(result.ok).toBe(true);
  });
});