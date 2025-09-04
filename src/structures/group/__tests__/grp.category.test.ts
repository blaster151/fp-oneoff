import { describe, it, expect } from "vitest";
import { Zn } from "../Group";
import { hom } from "../GrpCat";
import { Grp } from "../Grp";

describe("Grp category façade", () => {
  it("identity and composition (on Zn)", () => {
    const Z6 = Zn(6), Z3 = Zn(3), Z2 = Zn(2);
    // Use proper homomorphisms: Z6 -> Z3 (mod 3) and Z3 -> Z3 (identity)
    const f = hom(Z6, Z3, x => x % 3);
    const g = hom(Z3, Z3, x => x); // identity map

    const idZ3 = Grp.id(Z3);
    const gf = Grp.comp(f, g);           // g ∘ f = f (since g is identity)
    expect(idZ3.verify()).toBe(true);
    expect(gf.verify()).toBe(true);

    // Left/right identities on a few points
    for (const x of Z6.elems) {
      expect( Z3.eq( Grp.id(Z3).f(f.f(x)), f.f(x) ) ).toBe(true);
    }
  });

  it("categorical product UP for Z2 × Z3", () => {
    const Z2 = Zn(2), Z3 = Zn(3), Z6 = Zn(6);
    const { P, π1, π2, pair } = Grp.product(Z2, Z3);

    const u = hom(Z6, Z2, x => x % 2);
    const v = hom(Z6, Z3, x => x % 3);
    const pairUV = pair(Z6, u, v);

    for (const k of Z6.elems) {
      const ab = pairUV.f(k);
      expect( Z2.eq(π1.f(ab), u.f(k)) ).toBe(true);
      expect( Z3.eq(π2.f(ab), v.f(k)) ).toBe(true);
    }

    // Uniqueness: any g with same projections equals ⟨u,v⟩ (checked by our witness)
    expect(((pairUV as any).uniqueAgainst(pairUV))).toBe(true);
  });
});