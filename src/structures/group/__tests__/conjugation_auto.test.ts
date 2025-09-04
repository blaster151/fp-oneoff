import { describe, it, expect } from "vitest";
import { Zn } from "../util/FiniteGroups";
import { conjugation, isInnerAutomorphism } from "../automorphisms/Conjugation";

/** On abelian groups, conjugation is the identity automorphism. */
describe("Conjugation is an automorphism (abelian sanity)", () => {
  const G = Zn(5);
  it("conj_g = id for all g in abelian G", () => {
    for (const g of G.elems) {
      const cg = conjugation(G, g);
      for (const x of G.elems) {
        expect(G.eq(cg.f(x), x)).toBe(true);
      }
      expect(isInnerAutomorphism(G, g)).toBe(true);
    }
  });
});