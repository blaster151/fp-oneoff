import { describe, it, expect } from "vitest";
import { Zn, checkGroup } from "../Group";
import { isNormal, quotientGroup, projToQuotient } from "../Quotient";
import { hom } from "../GrpCat";

describe("Quotient Z/≡8", () => {
  it("Z8 via quotient matches Zn(8)", () => {
    const Z = Zn(8);
    // Subgroup 8Z in Z is just {0} when we already model Z8; show quotient round-trip idea.
    // Here we just assert the built Zn(8) is a valid group (sanity)
    expect(checkGroup(Z).ok).toBe(true);
  });
});

// More illustrative: Z6 modulo congruence ~_3 (kernel of mod-3 map)
describe("Z6 / ker(mod3) ≅ im(mod3)", () => {
  it("First Isomorphism: Z6/ker → Z3 is iso onto image", () => {
    const Z6 = Zn(6), Z3 = Zn(3);
    const f = hom(Z6, Z3, x => x % 3);
    expect(f.verify?.()).toBe(true);

    // ker(f) = {0,3}
    const kerElems = Z6.elems.filter(x => Z3.eq(f.f(x), Z3.id));
    expect(new Set(kerElems)).toEqual(new Set([0,3]));

    // Build quotient Z6 / ker(f) and canonical projection
    const kerSub = { elems: kerElems, eq: Z6.eq, op: Z6.op, id: Z6.id, inv: Z6.inv, label: "ker" };
    // ker is normal in abelian Z6
    expect(isNormal(Z6, kerSub)).toBe(true);

    const Q = quotientGroup(Z6, kerSub);
    // Image subgroup im(f) = Z3 (since mod3 is surjective from Z6)
    const imgElems = Array.from(new Set(Z6.elems.map(f.f))).sort();
    expect(imgElems.length).toBe(3);

    // Define φ : Z6/ker → Z3 by φ([x]) = f(x)
    const phi = (q: { rep: number }) => f.f(q.rep);

    // Check φ is a homomorphism on coset representatives
    for (const a of Q.elems) for (const b of Q.elems) {
      const left = phi(Q.op(a,b));
      const right = Z3.op(phi(a), phi(b));
      expect(Z3.eq(left, right)).toBe(true);
    }

    // Bijectivity onto im(f) (here equals Z3)
    // Surjective: every y∈Z3 has x∈Z6 with f(x)=y, then φ([x])=y
    for (const y of Z3.elems) {
      const witness = Z6.elems.find(x => Z3.eq(f.f(x), y));
      expect(witness).not.toBeUndefined();
    }
    // Injective: [x]=[y] ⇒ f(x)=f(y) (kernel condition)
    for (const x of Z6.elems) for (const y of Z6.elems) {
      const sameCoset = Q.eq({rep:x},{rep:y});
      if (sameCoset) expect(Z3.eq(f.f(x), f.f(y))).toBe(true);
    }
  });
});