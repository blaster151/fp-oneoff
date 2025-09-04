import { describe, it, expect } from "vitest";
import { UnitsMod } from "../Units";
import { Zn } from "../Group";
import { productGroup } from "../GrpCat";
import { isIsomorphism } from "../Isomorphism";

describe("U8 ≅ Z2 × Z2", () => {
  it("explicit bijective hom", () => {
    const U8 = UnitsMod(8);              // {1,3,5,7} under × mod 8
    const Z2 = Zn(2);
    const Z2xZ2 = productGroup(Z2, Z2);

    // φ: U8 → Z2×Z2  (map by "which generators": 3 ↦ (1,0), 5 ↦ (0,1), 7=3·5 ↦ (1,1), 1 ↦ (0,0))
    const φ = (u:number) => {
      switch (u) {
        case 1: return [0,0] as [number,number];
        case 3: return [1,0] as [number,number];
        case 5: return [0,1] as [number,number];
        case 7: return [1,1] as [number,number];
        default: throw new Error("unexpected");
      }
    };

    const inv = isIsomorphism(U8, Z2xZ2, φ);
    expect(inv).not.toBeNull();

    // sanity: operation preservation on all pairs
    for (const a of U8.elems) for (const b of U8.elems) {
      const left = φ(U8.op(a,b));
      const right = Z2xZ2.op(φ(a), φ(b));
      expect(Z2xZ2.eq(left, right)).toBe(true);
    }
  });
});