import { describe, it, expect } from "vitest";
import { Z2 } from "../examples/AbelianGroups";
import { enumerateHoms } from "../hom/Enumerate";
import { homAdd, zeroHom, homNeg } from "../AbGroup";
import { GroupHom } from "../../group/GrpCat";

describe("Hom(Z2,Z2) forms an abelian group under pointwise +", () => {
  const G = Z2, H = Z2;
  const HOM = enumerateHoms(G, H, 4); // should be two: id and collapse-to-0

  it("closure, identity, inverse, commutativity (checked on tiny set)", () => {
    const zero = zeroHom(G,H);
    // identity law: f + 0 = f
    for (const f of HOM) {
      const fplus0 = homAdd(f, zero, H);
      for (const a of G.elems) expect(H.eq(fplus0.f(a), f.f(a))).toBe(true);
    }
    // inverse: f + (-f) = 0
    for (const f of HOM) {
      const neg = homNeg(f, H);
      const sum = homAdd(f, neg, H);
      for (const a of G.elems) expect(H.eq(sum.f(a), H.id)).toBe(true);
    }
    // commutativity: f+g = g+f
    for (const f of HOM) for (const g of HOM) {
      const fg = homAdd(f,g,H), gf = homAdd(g,f,H);
      for (const a of G.elems) expect(H.eq(fg.f(a), gf.f(a))).toBe(true);
    }
  });
});