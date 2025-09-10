import { Zmod, groupHom } from "../../helpers/groups";
import { product } from "../../../src/algebra/group/GroupProduct";

describe("Product in Grp satisfies the universal property", () => {
  it("π₁, π₂ projections and unique mediating map", () => {
    const G = Zmod(2), H = Zmod(3), K = Zmod(6);
    const f = groupHom(K, G, k => k % 2);
    const g = groupHom(K, H, k => k % 3);

    const { P, π1, π2, pair } = product(G, H);
    const { mediating, uniqueness } = pair(K, f, g);

    // commuting triangles: π1∘⟨f,g⟩ = f and π2∘⟨f,g⟩ = g
    for (const k of K.elems) {
      expect(π1.map(mediating.map(k))).toBe(f.map(k));
      expect(π2.map(mediating.map(k))).toBe(g.map(k));
    }

    // uniqueness: any other h with same projections equals mediating
    expect(uniqueness(mediating)).toBe(true);
  });

  it("product structure is correct", () => {
    const G = Zmod(2), H = Zmod(3);
    const { P, π1, π2 } = product(G, H);

    // Check product has correct size
    expect(P.elems.length).toBe(6);
    
    // Check projections are homomorphisms
    expect(π1.witnesses?.isHom).toBe(true);
    expect(π2.witnesses?.isHom).toBe(true);
    
    // Check product operation
    const x: [number, number] = [1, 2];
    const y: [number, number] = [1, 1];
    const result = P.op(x, y);
    expect(result).toEqual([0, 0]); // (1+1) mod 2 = 0, (2+1) mod 3 = 0
  });
});