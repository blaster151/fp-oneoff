import { describe, it, expect } from "vitest";
import { 
  tryBuildInverse, 
  buildAndVerifyInverse, 
  detectIsomorphism,
  findIsomorphisms,
  areGroupsIsomorphic,
  countIsomorphisms
} from "../InverseConstruction";
import { Group, Homomorphism } from "../IsomorphismWitnesses";
import { Zn } from "../../../../structures/group/util/FiniteGroups";

describe("Inverse Construction Workflow", () => {
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

  describe("tryBuildInverse", () => {
    it("should build inverse for bijective homomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const inverse = tryBuildInverse(id, elements, elements);
      
      expect(inverse).not.toBeNull();
      expect(inverse!.source).toBe(Z2);
      expect(inverse!.target).toBe(Z2);
      expect(inverse!.map(0)).toBe(0);
      expect(inverse!.map(1)).toBe(1);
    });

    it("should return null for non-injective homomorphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const inverse = tryBuildInverse(constant, elements, elements);
      
      expect(inverse).toBeNull();
    });

    it("should return null for non-surjective homomorphism", () => {
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x * 2 // Maps to {0, 2} in Z4
      };

      const elementsA = [0, 1];
      const elementsB = [0, 1, 2, 3];
      const inverse = tryBuildInverse(inclusion, elementsA, elementsB);
      
      expect(inverse).toBeNull();
    });

    it("should build inverse for scaling automorphism", () => {
      const Z4 = Zn(4);
      const elements = Z4.elems;
      
      const scale3: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (3 * x) % 4
      };

      const inverse = tryBuildInverse(scale3, elements, elements);
      
      expect(inverse).not.toBeNull();
      expect(inverse!.source).toBe(Z4);
      expect(inverse!.target).toBe(Z4);
      
      // Verify the inverse is correct
      expect(inverse!.map(0)).toBe(0);
      expect(inverse!.map(1)).toBe(3); // 3 * 3 = 9 ≡ 1 (mod 4)
      expect(inverse!.map(2)).toBe(2); // 3 * 2 = 6 ≡ 2 (mod 4)
      expect(inverse!.map(3)).toBe(1); // 3 * 1 = 3 ≡ 3 (mod 4)
    });
  });

  describe("buildAndVerifyInverse", () => {
    it("should build and verify valid isomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const result = buildAndVerifyInverse(id, elements, elements);
      
      expect(result.inverse).not.toBeNull();
      expect(result.isIsomorphism).toBe(true);
      expect(result.verification).not.toBeNull();
      expect(result.verification!.isCompleteInverse).toBe(true);
    });

    it("should detect non-isomorphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const result = buildAndVerifyInverse(constant, elements, elements);
      
      expect(result.inverse).toBeNull();
      expect(result.isIsomorphism).toBe(false);
      expect(result.verification).toBeNull();
    });
  });

  describe("detectIsomorphism", () => {
    it("should detect isomorphism with proof steps", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const result = detectIsomorphism(id, elements, elements);
      
      expect(result.isIsomorphism).toBe(true);
      expect(result.inverse).not.toBeNull();
      expect(result.proof.step1_buildable).toBe(true);
      expect(result.proof.step2_homomorphism).toBe(true);
      expect(result.proof.step3_roundTrip).toBe(true);
    });

    it("should detect non-isomorphism with proof steps", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const result = detectIsomorphism(constant, elements, elements);
      
      expect(result.isIsomorphism).toBe(false);
      expect(result.inverse).toBeNull();
      expect(result.proof.step1_buildable).toBe(false);
      expect(result.proof.step2_homomorphism).toBe(false);
      expect(result.proof.step3_roundTrip).toBe(false);
    });
  });

  describe("findIsomorphisms", () => {
    it("should find all isomorphisms between identical groups", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      const isomorphisms = findIsomorphisms(Z2, Z2, elements, elements);
      
      expect(isomorphisms.length).toBeGreaterThan(0);
      
      // Should include identity isomorphism
      const hasIdentity = isomorphisms.some(iso => 
        iso.forward.map(0) === 0 && iso.forward.map(1) === 1
      );
      expect(hasIdentity).toBe(true);
    });

    it("should find isomorphisms between isomorphic groups", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      // Create another Z2 group with different element representation
      const Z2Alt: Group<string> = {
        id: "e",
        op: (x, y) => (x === "e") !== (y === "e") ? "a" : "e",
        inv: (x) => x,
        eq: (x, y) => x === y
      };
      
      const elementsAlt = ["e", "a"];
      
      const isomorphisms = findIsomorphisms(Z2, Z2Alt, elements, elementsAlt);
      
      expect(isomorphisms.length).toBeGreaterThan(0);
    });

    it("should find no isomorphisms between non-isomorphic groups", () => {
      const Z2 = Zn(2);
      const Z3 = Zn(3);
      
      const isomorphisms = findIsomorphisms(Z2, Z3, Z2.elems, Z3.elems);
      
      expect(isomorphisms.length).toBe(0);
    });
  });

  describe("areGroupsIsomorphic", () => {
    it("should detect isomorphic groups", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      expect(areGroupsIsomorphic(Z2, Z2, elements, elements)).toBe(true);
    });

    it("should detect non-isomorphic groups", () => {
      const Z2 = Zn(2);
      const Z3 = Zn(3);
      
      expect(areGroupsIsomorphic(Z2, Z3, Z2.elems, Z3.elems)).toBe(false);
    });
  });

  describe("countIsomorphisms", () => {
    it("should count isomorphisms correctly", () => {
      const Z2 = Zn(2);
      const elements = Z2.elems;
      
      const count = countIsomorphisms(Z2, Z2, elements, elements);
      
      expect(count).toBeGreaterThan(0);
    });

    it("should return 0 for non-isomorphic groups", () => {
      const Z2 = Zn(2);
      const Z3 = Zn(3);
      
      const count = countIsomorphisms(Z2, Z3, Z2.elems, Z3.elems);
      
      expect(count).toBe(0);
    });
  });

  describe("Workflow Integration", () => {
    it("should complete full workflow: build → verify → detect", () => {
      const Z4 = Zn(4);
      const elements = Z4.elems;
      
      const scale3: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (3 * x) % 4
      };

      // Step 1: Try building inverse
      const inverse = tryBuildInverse(scale3, elements, elements);
      expect(inverse).not.toBeNull();

      // Step 2: Build and verify
      const verification = buildAndVerifyInverse(scale3, elements, elements);
      expect(verification.isIsomorphism).toBe(true);

      // Step 3: Detect with proof
      const detection = detectIsomorphism(scale3, elements, elements);
      expect(detection.isIsomorphism).toBe(true);
      expect(detection.proof.step1_buildable).toBe(true);
      expect(detection.proof.step2_homomorphism).toBe(true);
      expect(detection.proof.step3_roundTrip).toBe(true);
    });

    it("should handle non-isomorphism workflow", () => {
      const Z2 = Zn(2);
      const Z4 = Zn(4);
      
      const inclusion: Homomorphism<number, number> = {
        source: Z2,
        target: Z4,
        map: (x) => x * 2
      };

      // Step 1: Try building inverse (should fail)
      const inverse = tryBuildInverse(inclusion, Z2.elems, Z4.elems);
      expect(inverse).toBeNull();

      // Step 2: Build and verify (should fail)
      const verification = buildAndVerifyInverse(inclusion, Z2.elems, Z4.elems);
      expect(verification.isIsomorphism).toBe(false);

      // Step 3: Detect with proof (should fail)
      const detection = detectIsomorphism(inclusion, Z2.elems, Z4.elems);
      expect(detection.isIsomorphism).toBe(false);
      expect(detection.proof.step1_buildable).toBe(false);
    });
  });
});