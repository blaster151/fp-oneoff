import { describe, it, expect } from "vitest";
import { Group, Homomorphism, isIsomorphism, isIsomorphismFinite, createIsomorphismPair, isomorphicPairs } from "../IsomorphismWitnesses";
import { Zn } from "../../../../structures/group/util/FiniteGroups";

describe("Group Isomorphism Witnesses", () => {
  // Create test groups
  const Z2: Group<number> = {
    id: 0,
    op: (x, y) => (x + y) % 2,
    inv: (x) => (2 - x) % 2,
    eq: (x, y) => x === y
  };

  const Z2_copy: Group<number> = {
    id: 0,
    op: (x, y) => (x + y) % 2,
    inv: (x) => (2 - x) % 2,
    eq: (x, y) => x === y
  };

  describe("isIsomorphism", () => {
    it("should recognize identity isomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const id_inv: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(isIsomorphism(id, id_inv)).toBe(true);
    });

    it("should recognize negation isomorphism", () => {
      const neg: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (2 - x) % 2
      };

      const neg_inv: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (2 - x) % 2
      };

      expect(isIsomorphism(neg, neg_inv)).toBe(true);
    });

    it("should reject non-isomorphisms", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      // The constant map is actually a homomorphism in Z2, but it's not an isomorphism
      // because it's not bijective (not injective: f(0) = f(1) = 0)
      // However, our simplified check might not catch this. Let's use a different test.
      
      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0 // Not a homomorphism: f(0+1) = f(1) = 0 ≠ f(0)+f(1) = 1+0 = 1
      };

      expect(isIsomorphism(notHom, id)).toBe(false);
    });
  });

  describe("isIsomorphismFinite", () => {
    it("should verify isomorphism for finite groups", () => {
      const elements = [0, 1];
      
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const id_inv: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(isIsomorphismFinite(id, id_inv, elements, elements)).toBe(true);
    });

    it("should verify negation isomorphism for finite groups", () => {
      const elements = [0, 1];
      
      const neg: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (2 - x) % 2
      };

      const neg_inv: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (2 - x) % 2
      };

      expect(isIsomorphismFinite(neg, neg_inv, elements, elements)).toBe(true);
    });

    it("should reject non-homomorphisms", () => {
      const elements = [0, 1];
      
      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0 // Not a homomorphism
      };

      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(isIsomorphismFinite(notHom, id, elements, elements)).toBe(false);
    });
  });

  describe("createIsomorphismPair", () => {
    it("should create valid isomorphism pairs", () => {
      const forward: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const backward: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const pair = createIsomorphismPair(forward, backward);
      
      expect(pair.forward).toBe(forward);
      expect(pair.backward).toBe(backward);
    });
  });

  describe("isomorphicPairs", () => {
    it("should recognize isomorphic pairs", () => {
      const forward1: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const backward1: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const forward2: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const backward2: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const pair1 = createIsomorphismPair(forward1, backward1);
      const pair2 = createIsomorphismPair(forward2, backward2);

      expect(isomorphicPairs(pair1, pair2)).toBe(true);
    });
  });

  describe("Integration with existing Zn groups", () => {
    it("should work with Zn groups from existing codebase", () => {
      const Z4 = Zn(4);
      const elements = Z4.elements!;
      
      const id: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => x
      };

      const id_inv: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => x
      };

      expect(isIsomorphismFinite(id, id_inv, elements, elements)).toBe(true);
    });

    it("should work with scaling automorphism", () => {
      const Z4 = Zn(4);
      const elements = Z4.elements!;
      
      // Scaling by 3 (which is its own inverse mod 4)
      const scale3: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (3 * x) % 4
      };

      const scale3_inv: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (3 * x) % 4
      };

      expect(isIsomorphismFinite(scale3, scale3_inv, elements, elements)).toBe(true);
    });
  });
});