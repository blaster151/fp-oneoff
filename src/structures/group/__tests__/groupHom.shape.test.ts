import { describe, it, expect } from "vitest";
import { FiniteGroup } from "../Group";
import { GroupHom, hom } from "../GrpCat";

// Minimal fake group for shape checks
const G: FiniteGroup<number> = {
  elems: [0,1],
  id: 0,
  op: (a,b) => (a + b) % 2,
  inv: a => a,
  eq: (a,b) => a === b
};
const H: FiniteGroup<number> = { ...G };

describe("GroupHom enriched shape", () => {
  it("has source/target/f", () => {
    const h: GroupHom<number, number> = hom(G, H, a => a);
    expect(h.source).toBe(G);
    expect(h.target).toBe(H);
    expect(h.f(1)).toBe(1);
  });
});