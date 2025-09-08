import { describe, it, expect } from "vitest";
import { GroupIsomorphism, GroupAutomorphism, identityAutomorphism, negationAutomorphism, scalingAutomorphism, conjugationAutomorphism } from "../GroupIsomorphism";
import { Zn } from "../../../structures/group/util/FiniteGroups";

describe("GroupIsomorphism", () => {
  describe("Basic isomorphism properties", () => {
    it("should be a refinement of GroupHom", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      // Create a simple isomorphism: Z4 -> Z2 by x -> x % 2
      const iso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2  // Inverse: 0 -> 0, 1 -> 2
      );

      // Should inherit homomorphism properties
      expect(iso.source).toBe(Z4);
      expect(iso.target).toBe(Z2);
      expect(iso.map(0)).toBe(0);
      expect(iso.map(1)).toBe(1);
      expect(iso.map(2)).toBe(0);
      expect(iso.map(3)).toBe(1);
    });

    it("should verify left inverse law", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const iso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2
      );

      expect(iso.leftInverse()).toBe(true);
    });

    it("should verify right inverse law", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const iso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2
      );

      expect(iso.rightInverse()).toBe(true);
    });

    it("should verify complete isomorphism", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const iso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2
      );

      expect(iso.verifyIsomorphism()).toBe(true);
    });

    it("should detect broken isomorphism", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      // This is NOT an isomorphism - wrong inverse
      const brokenIso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y  // Wrong inverse: should be 0->0, 1->2
      );

      expect(brokenIso.leftInverse()).toBe(false);
      expect(brokenIso.verifyIsomorphism()).toBe(false);
    });
  });

  describe("Isomorphism composition", () => {
    it("should compose isomorphisms correctly", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      const Z1 = Zn(1);
      
      const iso1 = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2
      );
      
      const iso2 = new GroupIsomorphism(
        Z2,
        Z1,
        (x: number) => 0,  // Everything maps to 0
        (y: number) => 0   // Only 0 maps back
      );
      
      const composed = iso1.compose(iso2);
      
      expect(composed.source).toBe(Z4);
      expect(composed.target).toBe(Z1);
      expect(composed.map(0)).toBe(0);
      expect(composed.map(1)).toBe(0);
      expect(composed.map(2)).toBe(0);
      expect(composed.map(3)).toBe(0);
    });

    it("should get inverse isomorphism", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const iso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2
      );
      
      const inverse = iso.getInverse();
      
      expect(inverse.source).toBe(Z2);
      expect(inverse.target).toBe(Z4);
      expect(inverse.map(0)).toBe(0);
      expect(inverse.map(1)).toBe(2);
    });
  });

  describe("Integration with law testing framework", () => {
    it("should generate isomorphism laws", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const iso = new GroupIsomorphism(
        Z4,
        Z2,
        (x: number) => x % 2,
        (y: number) => y === 0 ? 0 : 2
      );
      
      const laws = iso.getIsomorphismLaws();
      expect(laws).toHaveLength(2); // left and right inverse laws
      expect(laws[0].name).toContain("rightLeft");
      expect(laws[1].name).toContain("leftRight");
    });
  });
});

describe("GroupAutomorphism", () => {
  describe("Identity automorphism", () => {
    it("should create identity automorphism", () => {
      const Z4 = Zn(4);
      const id = identityAutomorphism(Z4);
      
      expect(id.source).toBe(Z4);
      expect(id.target).toBe(Z4);
      expect(id.map(0)).toBe(0);
      expect(id.map(1)).toBe(1);
      expect(id.map(2)).toBe(2);
      expect(id.map(3)).toBe(3);
      expect(id.verifyIsomorphism()).toBe(true);
    });
  });

  describe("Negation automorphism", () => {
    it("should create negation automorphism for additive groups", () => {
      const Z4 = Zn(4);
      const neg = negationAutomorphism(Z4);
      
      expect(neg.map(0)).toBe(0);  // -0 = 0
      expect(neg.map(1)).toBe(3);  // -1 = 3 (mod 4)
      expect(neg.map(2)).toBe(2);  // -2 = 2 (mod 4)
      expect(neg.map(3)).toBe(1);  // -3 = 1 (mod 4)
      expect(neg.verifyIsomorphism()).toBe(true);
    });

    it("should be its own inverse", () => {
      const Z4 = Zn(4);
      const neg = negationAutomorphism(Z4);
      
      // For negation, the inverse is also negation
      expect(neg.inverse(0)).toBe(0);
      expect(neg.inverse(1)).toBe(3);
      expect(neg.inverse(2)).toBe(2);
      expect(neg.inverse(3)).toBe(1);
    });
  });

  describe("Scaling automorphism", () => {
    it("should create scaling automorphism", () => {
      const Z4 = Zn(4);
      const scale = scalingAutomorphism(Z4, 3);
      
      expect(scale.map(0)).toBe(0);  // 3 * 0 = 0
      expect(scale.map(1)).toBe(3);  // 3 * 1 = 3
      expect(scale.map(2)).toBe(2);  // 3 * 2 = 6 ≡ 2 (mod 4)
      expect(scale.map(3)).toBe(1);  // 3 * 3 = 9 ≡ 1 (mod 4)
      expect(scale.verifyIsomorphism()).toBe(true);
    });

    it("should have correct inverse", () => {
      const Z4 = Zn(4);
      const scale = scalingAutomorphism(Z4, 3);
      
      // The inverse should be scaling by 1/3 mod 4
      // Since 3 * 3 ≡ 1 (mod 4), the inverse of 3 is 3
      expect(scale.inverse(0)).toBe(0);  // 0 / 3 = 0
      expect(scale.inverse(1)).toBe(3);  // 1 / 3 = 3 (since 3 * 3 = 1)
      expect(scale.inverse(2)).toBe(2);  // 2 / 3 = 2 (since 3 * 2 = 2)
      expect(scale.inverse(3)).toBe(1);  // 3 / 3 = 1
    });

    it("should reject zero scaling factor", () => {
      const Z4 = Zn(4);
      expect(() => scalingAutomorphism(Z4, 0)).toThrow("Scaling factor cannot be zero");
    });
  });

  describe("Conjugation automorphism", () => {
    it("should create conjugation automorphism", () => {
      const Z4 = Zn(4);
      const conj = conjugationAutomorphism(Z4, 1);
      
      // Conjugation by 1: x -> 1 + x - 1 = x (identity)
      expect(conj.map(0)).toBe(0);
      expect(conj.map(1)).toBe(1);
      expect(conj.map(2)).toBe(2);
      expect(conj.map(3)).toBe(3);
      expect(conj.verifyIsomorphism()).toBe(true);
    });

    it("should create non-trivial conjugation", () => {
      const Z4 = Zn(4);
      const conj = conjugationAutomorphism(Z4, 2);
      
      // Conjugation by 2: x -> 2 + x - 2 = x (still identity in abelian group)
      expect(conj.map(0)).toBe(0);
      expect(conj.map(1)).toBe(1);
      expect(conj.map(2)).toBe(2);
      expect(conj.map(3)).toBe(3);
    });
  });

  describe("Power automorphism", () => {
    it("should create power automorphism", () => {
      const Z4 = Zn(4);
      const power = powerAutomorphism(Z4, 3);
      
      // x^3 in additive group means 3x
      expect(power.map(0)).toBe(0);  // 3 * 0 = 0
      expect(power.map(1)).toBe(3);  // 3 * 1 = 3
      expect(power.map(2)).toBe(2);  // 3 * 2 = 6 ≡ 2 (mod 4)
      expect(power.map(3)).toBe(1);  // 3 * 3 = 9 ≡ 1 (mod 4)
      expect(power.verifyIsomorphism()).toBe(true);
    });
  });

  describe("Type safety", () => {
    it("should enforce GroupAutomorphism<A> = GroupIsomorphism<A, A>", () => {
      const Z4 = Zn(4);
      const id: GroupAutomorphism<number> = identityAutomorphism(Z4);
      
      // This should compile without issues
      expect(id.source).toBe(id.target);
      expect(id.verifyIsomorphism()).toBe(true);
    });
  });
});