import { describe, it, expect } from "vitest";
import { Z2, Z3, Zn } from "../util/FiniteGroups";
import { tupleScheme } from "../pairing/PairingScheme";
import { productGroup } from "../builders/Product";
import { projections, pairHom } from "../builders/ProductUP";
import { homEqByPoints } from "../cat/GroupCat";
import { GroupHom } from "../GrpCat";
import { isHom } from "../Isomorphism";

// Helper to check if a GroupHom object is a valid homomorphism
function isHomomorphism<A, B>(h: GroupHom<A, B>): boolean {
  return isHom(h.source, h.target, h.f);
}

describe("Universal property of product groups", () => {
  const G = Z2, H = Z3;
  const S = tupleScheme<number, number>();
  const GH = productGroup(G, H, S);

  // K = Z6 with mod projections
  const K = Zn(6);
  const mod2: GroupHom<number, number> = { source: K, target: G, f: (k) => k % 2 };
  const mod3: GroupHom<number, number> = { source: K, target: H, f: (k) => k % 3 };

  it("projections are homomorphisms", () => {
    const { pi1, pi2 } = projections(G, H, S, GH);
    expect(isHomomorphism(pi1)).toBe(true);
    expect(isHomomorphism(pi2)).toBe(true);
  });

  it("pair ⟨mod2,mod3⟩ mediates and is a homomorphism", () => {
    const u = pairHom(K, G, H, S, GH, mod2, mod3);
    expect(isHomomorphism(u)).toBe(true);

    const { pi1, pi2 } = projections(G, H, S, GH);
    // π1 ∘ u = mod2, π2 ∘ u = mod3  (pointwise check)
    const comp = <A, B, C>(f: GroupHom<A, B>, g: GroupHom<B, C>): GroupHom<A, C> =>
      ({ source: f.source, target: g.target, f: (a) => g.f(f.f(a)) });

    expect(homEqByPoints(comp(u, pi1), mod2)).toBe(true);
    expect(homEqByPoints(comp(u, pi2), mod3)).toBe(true);
  });

  it("uniqueness: any h with π∘h = (mod2,mod3) equals ⟨mod2,mod3⟩", () => {
    const u = pairHom(K, G, H, S, GH, mod2, mod3);
    const { pi1, pi2 } = projections(G, H, S, GH);

    // fabricate another h satisfying the same equalities
    const h: typeof u = { source: K, target: GH, f: (k) => ({ a: k % 2, b: k % 3 }) as any };

    // impose the equations π1∘h=mod2 and π2∘h=mod3 (verified)
    const comp = <A, B, C>(f: GroupHom<A, B>, g: GroupHom<B, C>): GroupHom<A, C> =>
      ({ source: f.source, target: g.target, f: (a) => g.f(f.f(a)) });

    expect(homEqByPoints(comp(h, pi1), mod2)).toBe(true);
    expect(homEqByPoints(comp(h, pi2), mod3)).toBe(true);

    // uniqueness: h = u (extensional equality on finite carrier)
    expect(homEqByPoints(h, u)).toBe(true);
  });
});