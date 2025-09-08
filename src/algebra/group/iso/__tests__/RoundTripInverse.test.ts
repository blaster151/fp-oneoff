import { describe, it, expect } from "vitest";
import { 
  checkIsInverse, 
  checkIsCompleteInverse, 
  theorem4RoundTrip,
  forwardDirectionProof,
  converseDirectionProof,
  enforceInverseLaws
} from "../RoundTripInverse";
import { Group, Homomorphism } from "../IsomorphismWitnesses";
import { Zn } from "../../../../structures/group/util/FiniteGroups";

describe("Round-trip Inverse Checking (Theorem 4 Proof Flow)", () => {
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

  describe("checkIsInverse", () => {
    it("should verify valid inverse with homomorphism preservation", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const result = checkIsInverse(
        id, id, elements, elements,
        Z2.op, Z2.op
      );
      
      expect(result).toBe(true);
    });

    it("should reject non-homomorphic inverse", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0 // Not a homomorphism
      };

      const elements = [0, 1];
      const result = checkIsInverse(
        id, notHom, elements, elements,
        Z2.op, Z2.op
      );
      
      expect(result).toBe(false);
    });

    it("should reject inverse that fails round-trip laws", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const wrongInverse: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (x + 1) % 2 // Wrong inverse
      };

      const elements = [0, 1];
      const result = checkIsInverse(
        id, wrongInverse, elements, elements,
        Z2.op, Z2.op
      );
      
      expect(result).toBe(false);
    });
  });

  describe("checkIsCompleteInverse", () => {
    it("should provide detailed verification of complete inverse", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const result = checkIsCompleteInverse(id, id, elements, elements);
      
      expect(result.fIsHomomorphism).toBe(true);
      expect(result.gIsHomomorphism).toBe(true);
      expect(result.leftIdentity).toBe(true);
      expect(result.rightIdentity).toBe(true);
      expect(result.isCompleteInverse).toBe(true);
    });

    it("should detect non-homomorphic f", () => {
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

      const elements = [0, 1];
      const result = checkIsCompleteInverse(notHom, id, elements, elements);
      
      expect(result.fIsHomomorphism).toBe(false);
      expect(result.isCompleteInverse).toBe(false);
    });

    it("should detect non-homomorphic g", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0 // Not a homomorphism
      };

      const elements = [0, 1];
      const result = checkIsCompleteInverse(id, notHom, elements, elements);
      
      expect(result.gIsHomomorphism).toBe(false);
      expect(result.isCompleteInverse).toBe(false);
    });
  });

  describe("theorem4RoundTrip", () => {
    it("should implement Theorem 4 characterization", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const theorem4 = theorem4RoundTrip(id, elements, elements);
      
      expect(theorem4(id)).toBe(true);
    });

    it("should reject non-inverse", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const notInverse: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (x + 1) % 2
      };

      const elements = [0, 1];
      const theorem4 = theorem4RoundTrip(id, elements, elements);
      
      expect(theorem4(notInverse)).toBe(false);
    });
  });

  describe("forwardDirectionProof", () => {
    it("should verify forward direction of Theorem 4", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const proof = forwardDirectionProof(id, id, elements, elements);
      
      expect(proof.fIsBijective).toBe(true);
      expect(proof.gIsHomomorphism).toBe(true);
      expect(proof.conclusion).toBe(true);
    });

    it("should detect non-bijective f", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const proof = forwardDirectionProof(constant, constant, elements, elements);
      
      expect(proof.fIsBijective).toBe(false);
      expect(proof.conclusion).toBe(false);
    });
  });

  describe("converseDirectionProof", () => {
    it("should verify converse direction of Theorem 4", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const proof = converseDirectionProof(id, id, elements, elements);
      
      expect(proof.gIsHomomorphism).toBe(true);
      expect(proof.leftIdentity).toBe(true);
      expect(proof.rightIdentity).toBe(true);
      expect(proof.conclusion).toBe(true);
    });

    it("should detect non-homomorphic g", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0
      };

      const elements = [0, 1];
      const proof = converseDirectionProof(id, notHom, elements, elements);
      
      expect(proof.gIsHomomorphism).toBe(false);
      expect(proof.conclusion).toBe(false);
    });
  });

  describe("enforceInverseLaws", () => {
    it("should enforce all inverse laws", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const laws = enforceInverseLaws(id, id, elements, elements);
      
      expect(laws.law1_fIsHomomorphism).toBe(true);
      expect(laws.law2_gIsHomomorphism).toBe(true);
      expect(laws.law3_leftIdentity).toBe(true);
      expect(laws.law4_rightIdentity).toBe(true);
      expect(laws.allLawsSatisfied).toBe(true);
    });

    it("should detect law violations", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const notHom: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x === 0 ? 1 : 0
      };

      const elements = [0, 1];
      const laws = enforceInverseLaws(id, notHom, elements, elements);
      
      expect(laws.law1_fIsHomomorphism).toBe(true);
      expect(laws.law2_gIsHomomorphism).toBe(false);
      expect(laws.allLawsSatisfied).toBe(false);
    });
  });

  describe("Integration with Zn groups", () => {
    it("should work with Z4 scaling automorphism", () => {
      const Z4 = Zn(4);
      const elements = Z4.elements!;
      
      const scale3: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (3 * x) % 4
      };

      const result = checkIsCompleteInverse(scale3, scale3, elements, elements);
      expect(result.isCompleteInverse).toBe(true);
    });

    it("should work with Z4 negation automorphism", () => {
      const Z4 = Zn(4);
      const elements = Z4.elements!;
      
      const neg: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (4 - x) % 4
      };

      const result = checkIsCompleteInverse(neg, neg, elements, elements);
      expect(result.isCompleteInverse).toBe(true);
    });
  });

  describe("Mathematical Properties", () => {
    it("should verify Theorem 4 bidirectional equivalence", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      
      // Forward direction: isomorphism ⟹ homomorphic inverse
      const forward = forwardDirectionProof(id, id, elements, elements);
      
      // Converse direction: homomorphic inverse ⟹ isomorphism
      const converse = converseDirectionProof(id, id, elements, elements);
      
      // Both should be true for a valid isomorphism
      expect(forward.conclusion).toBe(true);
      expect(converse.conclusion).toBe(true);
    });

    it("should verify law-level enforcement", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const laws = enforceInverseLaws(id, id, elements, elements);
      
      // All laws should be satisfied for a valid isomorphism
      expect(laws.allLawsSatisfied).toBe(true);
      
      // Individual law checks should match
      expect(laws.law1_fIsHomomorphism).toBe(true);
      expect(laws.law2_gIsHomomorphism).toBe(true);
      expect(laws.law3_leftIdentity).toBe(true);
      expect(laws.law4_rightIdentity).toBe(true);
    });
  });
});