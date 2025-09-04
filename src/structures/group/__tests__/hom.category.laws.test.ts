import { describe, it, expect } from "vitest";
import { Zn } from "../Group";
import { hom, idHom, comp } from "../GrpCat";

describe("Grp: hom composition laws", () => {
  it("composition, identity, associativity", () => {
    const Z6 = Zn(6), Z3 = Zn(3), Z2 = Zn(2);

    const f = hom(Z6, Z3, x => x % 3);
    const g = hom(Z3, Z2, x => x % 2);
    const h = hom(Z2, Z2, x => x);

    // (2) associativity
    const hComposeG = comp(g,h);        // Z3→Z2
    const gComposeF = comp(f,g);        // Z6→Z2
    const lhs = comp(gComposeF, h);     // h ∘ (g ∘ f)
    const rhs = comp(f, hComposeG);     // (h ∘ g) ∘ f
    for (const x of Z6.elems) expect(Z2.eq(lhs.f(x), rhs.f(x))).toBe(true);

    // (3) identities
    const idZ6 = idHom(Z6), idZ3 = idHom(Z3);
    const f1 = comp(idZ6, f);
    const f2 = comp(f, idZ3);
    for (const x of Z6.elems) expect(Z3.eq(f1.f(x), f.f(x))).toBe(true);
    for (const x of Z6.elems) expect(Z3.eq(f2.f(x), f.f(x))).toBe(true);
  });
});