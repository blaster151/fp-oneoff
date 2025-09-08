import { describe, it, expect } from "vitest";
import { 
  hasInverse, 
  makeCategoricalInverseWitness, 
  isCategoricalIsomorphism,
  FunctionCategory,
  makeGroupCategory,
  groupToCategorical,
  theorem4Categorical,
  isBijective,
  constructInverseFunction
} from "../Isomorphism";
import { Group } from "../../algebra/group/iso/IsomorphismWitnesses";

describe("Categorical Isomorphism (Generalization Hook)", () => {
  describe("hasInverse", () => {
    it("should check inverse for simple functions", () => {
      const f = (x: number) => x + 1;
      const g = (x: number) => x - 1;
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      expect(hasInverse(f, g, elemsA, elemsB)).toBe(true);
    });

    it("should reject non-inverse functions", () => {
      const f = (x: number) => x + 1;
      const g = (x: number) => x + 2; // Wrong inverse
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      expect(hasInverse(f, g, elemsA, elemsB)).toBe(false);
    });

    it("should work with custom equality", () => {
      const f = (x: number) => x % 3;
      const g = (x: number) => x;
      const elemsA = [0, 1, 2, 3, 4, 5];
      const elemsB = [0, 1, 2];
      
      // Custom equality for modular arithmetic
      const modEq = (a: number, b: number) => a % 3 === b % 3;
      
      expect(hasInverse(f, g, elemsA, elemsB, modEq, modEq)).toBe(true);
    });
  });

  describe("makeCategoricalInverseWitness", () => {
    it("should create categorical inverse witness", () => {
      const f = { source: "A", target: "B", map: (x: number) => x + 1 };
      const g = { source: "B", target: "A", map: (x: number) => x - 1 };
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      const witness = makeCategoricalInverseWitness(f, g, elemsA, elemsB);
      
      expect(witness.leftIdentity).toBe(true);
      expect(witness.rightIdentity).toBe(true);
      expect(witness.f).toBe(f);
      expect(witness.g).toBe(g);
    });
  });

  describe("isCategoricalIsomorphism", () => {
    it("should recognize categorical isomorphism", () => {
      const f = { source: "A", target: "B", map: (x: number) => x + 1 };
      const g = { source: "B", target: "A", map: (x: number) => x - 1 };
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      const witness = makeCategoricalInverseWitness(f, g, elemsA, elemsB);
      expect(isCategoricalIsomorphism(witness)).toBe(true);
    });

    it("should reject non-isomorphism", () => {
      const f = { source: "A", target: "B", map: (x: number) => x + 1 };
      const g = { source: "B", target: "A", map: (x: number) => x + 2 }; // Wrong inverse
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      const witness = makeCategoricalInverseWitness(f, g, elemsA, elemsB);
      expect(isCategoricalIsomorphism(witness)).toBe(false);
    });
  });

  describe("FunctionCategory", () => {
    it("should provide identity function", () => {
      expect(FunctionCategory.id(42)).toBe(42);
      expect(FunctionCategory.id("hello")).toBe("hello");
    });

    it("should compose functions correctly", () => {
      const f = (x: number) => x * 2;
      const g = (x: number) => x + 1;
      const composed = FunctionCategory.compose(f, g);
      
      expect(composed(3)).toBe(8); // f(g(3)) = f(4) = 8
    });
  });

  describe("makeGroupCategory", () => {
    it("should create group category", () => {
      const Z2: Group<number> = {
        id: 0,
        op: (x, y) => (x + y) % 2,
        inv: (x) => (2 - x) % 2,
        eq: (x, y) => x === y
      };

      const groupCat = makeGroupCategory(Z2);
      
      expect(groupCat.id(1)).toBe(1);
      
      const f = (x: number) => x * 2;
      const g = (x: number) => x + 1;
      const composed = groupCat.compose(f, g);
      
      expect(composed(3)).toBe(8); // f(g(3)) = f(4) = 8
    });
  });

  describe("groupToCategorical", () => {
    it("should bridge group-specific to categorical", () => {
      const Z2: Group<number> = {
        id: 0,
        op: (x, y) => (x + y) % 2,
        inv: (x) => (2 - x) % 2,
        eq: (x, y) => x === y
      };

      const groupF = {
        source: Z2,
        target: Z2,
        map: (x: number) => x
      };

      const groupG = {
        source: Z2,
        target: Z2,
        map: (x: number) => x
      };

      const categorical = groupToCategorical(groupF, groupG);
      
      expect(categorical.f.source).toBe(Z2);
      expect(categorical.f.target).toBe(Z2);
      expect(categorical.g.source).toBe(Z2);
      expect(categorical.g.target).toBe(Z2);
    });
  });

  describe("theorem4Categorical", () => {
    it("should implement Theorem 4 in categorical terms", () => {
      const f = { source: "A", target: "B", map: (x: number) => x + 1 };
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      const theorem4 = theorem4Categorical(f, elemsA, elemsB);
      
      const g = { source: "B", target: "A", map: (x: number) => x - 1 };
      const witness = theorem4(g);
      
      expect(isCategoricalIsomorphism(witness)).toBe(true);
    });
  });

  describe("isBijective", () => {
    it("should recognize bijective functions", () => {
      const f = (x: number) => x + 1;
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      expect(isBijective(f, elemsA, elemsB)).toBe(true);
    });

    it("should reject non-injective functions", () => {
      const f = (x: number) => 0; // Constant function
      const elemsA = [0, 1, 2];
      const elemsB = [0];
      
      expect(isBijective(f, elemsA, elemsB)).toBe(false);
    });

    it("should reject non-surjective functions", () => {
      const f = (x: number) => x + 1;
      const elemsA = [0, 1];
      const elemsB = [1, 2, 3]; // Target has more elements
      
      expect(isBijective(f, elemsA, elemsB)).toBe(false);
    });

    it("should work with custom equality", () => {
      // Create a bijective function with custom equality
      const f = (x: number) => x + 1;
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      // Custom equality that treats numbers as equivalent if they have the same remainder mod 3
      const modEq = (a: number, b: number) => a % 3 === b % 3;
      
      // This should be bijective with the custom equality
      expect(isBijective(f, elemsA, elemsB, modEq)).toBe(true);
    });
  });

  describe("constructInverseFunction", () => {
    it("should construct inverse for bijective function", () => {
      const f = (x: number) => x + 1;
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      const inverse = constructInverseFunction(f, elemsA, elemsB);
      
      expect(inverse).not.toBeNull();
      expect(inverse!(1)).toBe(0);
      expect(inverse!(2)).toBe(1);
      expect(inverse!(3)).toBe(2);
    });

    it("should return null for non-bijective function", () => {
      const f = (x: number) => 0; // Constant function
      const elemsA = [0, 1, 2];
      const elemsB = [0];
      
      const inverse = constructInverseFunction(f, elemsA, elemsB);
      
      expect(inverse).toBeNull();
    });
  });

  describe("Mathematical Properties", () => {
    it("should verify categorical isomorphism properties", () => {
      // Test that categorical isomorphism is symmetric
      const f = { source: "A", target: "B", map: (x: number) => x + 1 };
      const g = { source: "B", target: "A", map: (x: number) => x - 1 };
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      
      const witness1 = makeCategoricalInverseWitness(f, g, elemsA, elemsB);
      const witness2 = makeCategoricalInverseWitness(g, f, elemsB, elemsA);
      
      expect(isCategoricalIsomorphism(witness1)).toBe(true);
      expect(isCategoricalIsomorphism(witness2)).toBe(true);
    });

    it("should verify composition preserves isomorphism", () => {
      // If f: A -> B and g: B -> C are isomorphisms, then g ∘ f: A -> C is an isomorphism
      const f = (x: number) => x + 1;
      const g = (x: number) => x * 2;
      const fInv = (x: number) => x - 1;
      const gInv = (x: number) => x / 2;
      
      const elemsA = [0, 1, 2];
      const elemsB = [1, 2, 3];
      const elemsC = [2, 4, 6];
      
      // Check that f and g are isomorphisms
      expect(hasInverse(f, fInv, elemsA, elemsB)).toBe(true);
      expect(hasInverse(g, gInv, elemsB, elemsC)).toBe(true);
      
      // Check that g ∘ f is an isomorphism with inverse fInv ∘ gInv
      const composed = (x: number) => g(f(x));
      const composedInv = (x: number) => fInv(gInv(x));
      
      expect(hasInverse(composed, composedInv, elemsA, elemsC)).toBe(true);
    });
  });
});