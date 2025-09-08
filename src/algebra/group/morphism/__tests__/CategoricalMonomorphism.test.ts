import { describe, it, expect } from "vitest";
import { 
  isMonomorphism, 
  isMonomorphismFinite, 
  generateMonomorphismTestPairs,
  isLeftCancellable,
  injectivityToMonomorphism,
  createInclusionExample,
  createMorphismWithProperties
} from "../CategoricalMonomorphism";
import { Group, Homomorphism } from "../../iso/IsomorphismWitnesses";
import { Zn } from "../../../../structures/group/util/FiniteGroups";

describe("Categorical Monomorphism (Left-cancellable Morphisms)", () => {
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

  describe("isMonomorphism", () => {
    it("should recognize monomorphism via left-cancellability", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const testPairs = generateMonomorphismTestPairs(id, [0, 1], [0, 1]);
      const result = isMonomorphism(id, testPairs, [0, 1]);
      
      expect(result).toBe(true);
    });

    it("should reject non-monomorphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const testPairs = generateMonomorphismTestPairs(constant, [0, 1], [0, 1]);
      const result = isMonomorphism(constant, testPairs, [0, 1]);
      
      expect(result).toBe(false);
    });
  });

  describe("isMonomorphismFinite", () => {
    it("should recognize injective homomorphism as monomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const result = isMonomorphismFinite(id, elements, elements);
      
      expect(result).toBe(true);
    });

    it("should reject non-injective homomorphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const result = isMonomorphismFinite(constant, elements, elements);
      
      expect(result).toBe(false);
    });

    it("should recognize inclusion as monomorphism", () => {
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x * 2 // 0 -> 0, 1 -> 2
      };

      const elementsA = [0, 1];
      const elementsB = [0, 1, 2, 3];
      const result = isMonomorphismFinite(inclusion, elementsA, elementsB);
      
      expect(result).toBe(true);
    });
  });

  describe("generateMonomorphismTestPairs", () => {
    it("should generate test pairs for monomorphism checking", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const testPairs = generateMonomorphismTestPairs(id, [0, 1], [0, 1]);
      
      expect(testPairs.length).toBeGreaterThan(0);
      expect(testPairs[0]).toHaveProperty('g');
      expect(testPairs[0]).toHaveProperty('h');
    });
  });

  describe("isLeftCancellable", () => {
    it("should check left-cancellability", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const leftCancellable = isLeftCancellable(id, [0, 1]);
      
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

      const result = leftCancellable(g, h);
      expect(result).toBe(true);
    });

    it("should detect non-left-cancellable morphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const leftCancellable = isLeftCancellable(constant, [0, 1]);
      
      const g: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const h: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (x + 1) % 2
      };

      const result = leftCancellable(g, h);
      expect(result).toBe(false);
    });
  });

  describe("injectivityToMonomorphism", () => {
    it("should verify injectivity ⟺ monomorphism equivalence", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const result = injectivityToMonomorphism(id, elements);
      
      expect(result.isInjective).toBe(true);
      expect(result.isMonomorphism).toBe(true);
      expect(result.equivalence).toBe(true);
    });

    it("should detect non-injective non-monomorphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const result = injectivityToMonomorphism(constant, elements);
      
      expect(result.isInjective).toBe(false);
      expect(result.isMonomorphism).toBe(false);
      expect(result.equivalence).toBe(true);
    });
  });

  describe("createInclusionExample", () => {
    it("should create Z → R inclusion example", () => {
      const example = createInclusionExample();
      
      expect(example.inclusion).toBeDefined();
      expect(example.isInjective).toBe(true);
      expect(example.hasLeftInverse).toBe(false);
      expect(example.isMonomorphism).toBe(true);
    });
  });

  describe("createMorphismWithProperties", () => {
    it("should create morphism with all categorical properties", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      const morphism = createMorphismWithProperties(
        Z2, Z2,
        (x) => x,
        elements, elements
      );
      
      expect(morphism.isMonomorphism).toBe(true);
      expect(morphism.isEpimorphism).toBe(true);
      expect(morphism.isIsomorphism).toBe(true);
    });

    it("should create monomorphism that is not epimorphism", () => {
      const Z2 = Zn(2);
      const Z4 = Zn(4);
      
      const morphism = createMorphismWithProperties(
        Z2, Z4,
        (x) => x * 2, // 0 -> 0, 1 -> 2
        Z2.elems, Z4.elems
      );
      
      expect(morphism.isMonomorphism).toBe(true);
      expect(morphism.isEpimorphism).toBe(false);
      expect(morphism.isIsomorphism).toBe(false);
    });

    it("should create epimorphism that is not monomorphism", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const morphism = createMorphismWithProperties(
        Z4, Z2,
        (x) => x % 2, // 0,2 -> 0; 1,3 -> 1
        Z4.elems, Z2.elems
      );
      
      expect(morphism.isMonomorphism).toBe(false);
      expect(morphism.isEpimorphism).toBe(true);
      expect(morphism.isIsomorphism).toBe(false);
    });

    it("should create neither monomorphism nor epimorphism", () => {
      const Z4 = Zn(4);
      const Z2 = Zn(2);
      
      const morphism = createMorphismWithProperties(
        Z4, Z2,
        (_) => 0, // Constant map
        Z4.elems, Z2.elems
      );
      
      expect(morphism.isMonomorphism).toBe(false);
      expect(morphism.isEpimorphism).toBe(false);
      expect(morphism.isIsomorphism).toBe(false);
    });
  });

  describe("Mathematical Properties", () => {
    it("should verify monomorphism composition", () => {
      // If f: A -> B and g: B -> C are monomorphisms, then g ∘ f: A -> C is a monomorphism
      const Z2 = Zn(2);
      const Z4 = Zn(4);
      const Z8 = Zn(8);
      
      const f: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x * 2 // 0 -> 0, 1 -> 2
      };

      const g: Homomorphism<number, number> = {
        source: Z4,
        target: Z8,
        map: (x) => x * 2 // 0 -> 0, 2 -> 4
      };

      const composed: Homomorphism<number, number> = {
        source: Z2,
        target: Z8,
        map: (x) => g.map(f.map(x)) // 0 -> 0, 1 -> 4
      };

      expect(isMonomorphismFinite(f, Z2.elems, Z4.elems)).toBe(true);
      expect(isMonomorphismFinite(g, Z4.elems, Z8.elems)).toBe(true);
      expect(isMonomorphismFinite(composed, Z2.elems, Z8.elems)).toBe(true);
    });

    it("should verify identity is monomorphism", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      expect(isMonomorphismFinite(id, elements, elements)).toBe(true);
    });

    it("should verify isomorphism is monomorphism", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      const neg: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (2 - x) % 2 // Negation automorphism
      };

      expect(isMonomorphismFinite(neg, elements, elements)).toBe(true);
    });
  });

  describe("Categorical vs Set-theoretic", () => {
    it("should demonstrate categorical monomorphism vs set-theoretic injectivity", () => {
      const Z2 = Zn(2);
      const Z4 = Zn(4);
      
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x * 2
      };

      // Set-theoretic: injective
      const isInjective = isMonomorphismFinite(inclusion, Z2.elems, Z4.elems);
      
      // Categorical: left-cancellable
      const testPairs = generateMonomorphismTestPairs(inclusion, Z2.elems, Z2.elems);
      const isMono = isMonomorphism(inclusion, testPairs, Z2.elems);
      
      // In concrete categories like Grp, these should be equivalent
      expect(isInjective).toBe(true);
      expect(isMono).toBe(true);
    });
  });
});