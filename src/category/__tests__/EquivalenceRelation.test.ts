import { describe, it, expect } from "vitest";
import { makeEquivalence, makeFiniteEquivalence, verifyEquivalenceRelation } from "../EquivalenceRelation";

describe("Equivalence Relation Kit", () => {
  describe("makeEquivalence", () => {
    it("should create equivalence witnesses for equality", () => {
      const eq = makeEquivalence<number>((a, b) => a === b);
      
      expect(eq.reflexive(5)).toBe(true);
      expect(eq.symmetric(3, 7)).toBe(true);
      expect(eq.symmetric(5, 5)).toBe(true);
      expect(eq.transitive(1, 2, 3)).toBe(true);
      expect(eq.transitive(5, 5, 5)).toBe(true);
    });

    it("should create equivalence witnesses for modular arithmetic", () => {
      const mod3 = makeEquivalence<number>((a, b) => a % 3 === b % 3);
      
      expect(mod3.reflexive(7)).toBe(true); // 7 ≡ 7 (mod 3)
      expect(mod3.symmetric(1, 4)).toBe(true); // 1 ≡ 4 (mod 3) and 4 ≡ 1 (mod 3)
      expect(mod3.symmetric(2, 5)).toBe(true); // 2 ≡ 5 (mod 3) and 5 ≡ 2 (mod 3)
      expect(mod3.transitive(1, 4, 7)).toBe(true); // 1 ≡ 4 ≡ 7 (mod 3)
    });

    it("should handle non-equivalence relations", () => {
      const lessThan = makeEquivalence<number>((a, b) => a < b);
      
      expect(lessThan.reflexive(5)).toBe(false); // 5 is not < 5
      expect(lessThan.symmetric(3, 7)).toBe(false); // 3 < 7 but not 7 < 3
    });
  });

  describe("makeFiniteEquivalence", () => {
    it("should verify equivalence relation for finite sets", () => {
      const elements = [0, 1, 2, 3, 4];
      const mod3 = makeFiniteEquivalence<number>(
        (a, b) => a % 3 === b % 3,
        elements
      );
      
      expect(mod3.checkAllElements(elements)).toBe(true);
    });

    it("should detect non-equivalence relations", () => {
      const elements = [0, 1, 2, 3, 4];
      const lessThan = makeFiniteEquivalence<number>(
        (a, b) => a < b,
        elements
      );
      
      expect(lessThan.checkAllElements(elements)).toBe(false);
    });
  });

  describe("verifyEquivalenceRelation", () => {
    it("should verify valid equivalence relations", () => {
      const elements = [0, 1, 2, 3, 4, 5];
      
      // Equality is an equivalence relation
      expect(verifyEquivalenceRelation((a, b) => a === b, elements)).toBe(true);
      
      // Modular arithmetic is an equivalence relation
      expect(verifyEquivalenceRelation((a, b) => a % 3 === b % 3, elements)).toBe(true);
    });

    it("should reject invalid relations", () => {
      const elements = [0, 1, 2, 3, 4, 5];
      
      // Less than is not an equivalence relation
      expect(verifyEquivalenceRelation((a, b) => a < b, elements)).toBe(false);
      
      // Greater than is not an equivalence relation
      expect(verifyEquivalenceRelation((a, b) => a > b, elements)).toBe(false);
    });
  });

  describe("Mathematical Properties", () => {
    it("should verify reflexivity property", () => {
      const eq = makeEquivalence<number>((a, b) => a === b);
      
      // Every element should be related to itself
      for (let i = 0; i < 10; i++) {
        expect(eq.reflexive(i)).toBe(true);
      }
    });

    it("should verify symmetry property", () => {
      const mod3 = makeEquivalence<number>((a, b) => a % 3 === b % 3);
      
      // If a ≡ b (mod 3), then b ≡ a (mod 3)
      expect(mod3.symmetric(1, 4)).toBe(true);
      expect(mod3.symmetric(4, 1)).toBe(true);
      expect(mod3.symmetric(2, 5)).toBe(true);
      expect(mod3.symmetric(5, 2)).toBe(true);
    });

    it("should verify transitivity property", () => {
      const mod3 = makeEquivalence<number>((a, b) => a % 3 === b % 3);
      
      // If a ≡ b (mod 3) and b ≡ c (mod 3), then a ≡ c (mod 3)
      expect(mod3.transitive(1, 4, 7)).toBe(true); // 1 ≡ 4 ≡ 7 (mod 3)
      expect(mod3.transitive(2, 5, 8)).toBe(true); // 2 ≡ 5 ≡ 8 (mod 3)
      expect(mod3.transitive(0, 3, 6)).toBe(true); // 0 ≡ 3 ≡ 6 (mod 3)
    });
  });
});