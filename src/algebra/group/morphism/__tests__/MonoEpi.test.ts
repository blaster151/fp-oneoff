import { describe, it, expect } from "vitest";
import { isMonomorphism, isMonomorphismFinite, isEpimorphism, isEpimorphismFinite, leftCancellable, rightCancellable, createMorphism } from "../MonoEpi";
import { Group, Homomorphism } from "../../iso/IsomorphismWitnesses";
import { Zn } from "../../../../structures/group/util/FiniteGroups";

describe("Monomorphism and Epimorphism", () => {
  // Create test groups
  const Z2: Group<number> = {
    id: 0,
    op: (x, y) => (x + y) % 2,
    inv: (x) => (2 - x) % 2,
    eq: (x, y) => x === y
  };

  const Z4: Group<number> = {
    id: 0,
    op: (x, y) => (x + y) % 4,
    inv: (x) => (4 - x) % 4,
    eq: (x, y) => x === y
  };

  describe("Monomorphism (Injective Homomorphism)", () => {
    it("should recognize identity as monomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(isMonomorphism(id)(0, 1)).toBe(true);
      expect(isMonomorphism(id)(1, 0)).toBe(true);
    });

    it("should recognize inclusion as monomorphism", () => {
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x // 0 -> 0, 1 -> 1
      };

      expect(isMonomorphism(inclusion)(0, 1)).toBe(true);
    });

    it("should reject non-injective maps", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      expect(isMonomorphism(constant)(0, 1)).toBe(false); // f(0) = f(1) = 0, but 0 ≠ 1
    });
  });

  describe("isMonomorphismFinite", () => {
    it("should verify monomorphism for finite groups", () => {
      const elements = [0, 1];
      
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(isMonomorphismFinite(id, elements)).toBe(true);
    });

    it("should verify inclusion as monomorphism for finite groups", () => {
      const elementsZ2 = [0, 1];
      const elementsZ4 = [0, 1, 2, 3];
      
      // Create a proper homomorphism from Z2 to Z4
      // We can map 0 -> 0, 1 -> 2 (this preserves the group structure)
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x * 2 // 0 -> 0, 1 -> 2
      };

      expect(isMonomorphismFinite(inclusion, elementsZ2)).toBe(true);
    });

    it("should reject non-homomorphisms", () => {
      const elements = [0, 1];
      
      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0 // Not a homomorphism
      };

      expect(isMonomorphismFinite(notHom, elements)).toBe(false);
    });
  });

  describe("Epimorphism (Surjective Homomorphism)", () => {
    it("should recognize identity as epimorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const epiCheck = isEpimorphism(id);
      expect(epiCheck([0, 1], [0, 1])).toBe(true);
    });

    it("should recognize surjective maps", () => {
      const surjective: Homomorphism<number, number> = {
        source: Z4,
        target: Z2,
        map: (x) => x % 2 // 0,2 -> 0; 1,3 -> 1
      };

      const epiCheck = isEpimorphism(surjective);
      expect(epiCheck([0, 1, 2, 3], [0, 1])).toBe(true);
    });

    it("should reject non-surjective maps", () => {
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x // Only hits 0,1, not 2,3
      };

      const epiCheck = isEpimorphism(inclusion);
      expect(epiCheck([0, 1], [0, 1, 2, 3])).toBe(false); // Only hits 0,1, not 2,3
    });
  });

  describe("isEpimorphismFinite", () => {
    it("should verify epimorphism for finite groups", () => {
      const elementsZ2 = [0, 1];
      const elementsZ4 = [0, 1, 2, 3];
      
      const surjective: Homomorphism<number, number> = {
        source: Z4,
        target: Z2,
        map: (x) => x % 2
      };

      expect(isEpimorphismFinite(surjective, elementsZ4, elementsZ2)).toBe(true);
    });

    it("should reject non-surjective maps", () => {
      const elementsZ2 = [0, 1];
      const elementsZ4 = [0, 1, 2, 3];
      
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x
      };

      expect(isEpimorphismFinite(inclusion, elementsZ2, elementsZ4)).toBe(false);
    });
  });

  describe("Left Cancellability (Categorical Monomorphism)", () => {
    it("should verify left cancellability for identity", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const leftCancel = leftCancellable(id);
      
      const g: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const h: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(leftCancel(g, h)).toBe(true);
    });
  });

  describe("Right Cancellability (Categorical Epimorphism)", () => {
    it("should verify right cancellability for identity", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const rightCancel = rightCancellable(id);
      
      const g: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const h: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(rightCancel(g, h)).toBe(true);
    });
  });

  describe("createMorphism", () => {
    it("should create morphism with categorical properties", () => {
      const elementsZ2 = [0, 1];
      const elementsZ4 = [0, 1, 2, 3];
      
      const inclusion = createMorphism(
        Z2,
        Z4,
        (x) => x * 2, // 0 -> 0, 1 -> 2 (proper homomorphism)
        elementsZ2,
        elementsZ4
      );

      expect(inclusion.isMono).toBe(true); // Injective
      expect(inclusion.isEpi).toBe(false); // Not surjective
      expect(inclusion.isIso).toBe(false); // Not both
    });

    it("should create isomorphism", () => {
      const elements = [0, 1];
      
      const id = createMorphism(
        Z2,
        Z2,
        (x) => x,
        elements,
        elements
      );

      expect(id.isMono).toBe(true); // Injective
      expect(id.isEpi).toBe(true); // Surjective
      expect(id.isIso).toBe(true); // Both = isomorphism
    });
  });

  describe("Integration with existing Zn groups", () => {
    it("should work with Zn groups", () => {
      const Z4 = Zn(4);
      const elements = Z4.elements!;
      
      const id: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => x
      };

      expect(isMonomorphismFinite(id, elements)).toBe(true);
      expect(isEpimorphismFinite(id, elements, elements)).toBe(true);
    });
  });
});