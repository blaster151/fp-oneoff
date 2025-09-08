import { describe, it, expect } from "vitest";
import { 
  makeInverseWitness, 
  isIsomorphismByInverse, 
  makeCompleteInverseWitness,
  createIsomorphismFromWitness,
  theorem4Characterization,
  canExtendToIsomorphism,
  constructInverse
} from "../InverseWitness";
import { Group, Homomorphism } from "../IsomorphismWitnesses";
import { Zn } from "../../../../structures/group/util/FiniteGroups";

describe("Inverse Witness System (Theorem 4)", () => {
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

  describe("makeInverseWitness", () => {
    it("should create valid inverse witness for identity isomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const witness = makeInverseWitness(id, id, elements, elements);
      
      expect(witness.leftIdentity).toBe(true);
      expect(witness.rightIdentity).toBe(true);
      expect(witness.f).toBe(id);
      expect(witness.g).toBe(id);
    });

    it("should create valid inverse witness for negation isomorphism", () => {
      const neg: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => (2 - x) % 2
      };

      const elements = [0, 1];
      const witness = makeInverseWitness(neg, neg, elements, elements);
      
      expect(witness.leftIdentity).toBe(true);
      expect(witness.rightIdentity).toBe(true);
    });

    it("should detect invalid inverse witness", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const witness = makeInverseWitness(id, constant, elements, elements);
      
      expect(witness.leftIdentity).toBe(false);
      expect(witness.rightIdentity).toBe(false);
    });
  });

  describe("isIsomorphismByInverse", () => {
    it("should recognize valid isomorphism by inverse", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const witness = makeInverseWitness(id, id, elements, elements);
      
      expect(isIsomorphismByInverse(witness)).toBe(true);
    });

    it("should reject invalid isomorphism by inverse", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const witness = makeInverseWitness(id, constant, elements, elements);
      
      expect(isIsomorphismByInverse(witness)).toBe(false);
    });
  });

  describe("makeCompleteInverseWitness", () => {
    it("should create complete witness with homomorphism checks", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const witness = makeCompleteInverseWitness(id, id, elements, elements);
      
      expect(witness.leftIdentity).toBe(true);
      expect(witness.rightIdentity).toBe(true);
      expect(witness.fIsHomomorphism).toBe(true);
      expect(witness.gIsHomomorphism).toBe(true);
      expect(witness.isCompleteIsomorphism).toBe(true);
    });

    it("should detect non-homomorphism in witness", () => {
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
      const witness = makeCompleteInverseWitness(id, notHom, elements, elements);
      
      expect(witness.fIsHomomorphism).toBe(true);
      expect(witness.gIsHomomorphism).toBe(false);
      expect(witness.isCompleteIsomorphism).toBe(false);
    });
  });

  describe("createIsomorphismFromWitness", () => {
    it("should create isomorphism from valid witness", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const witness = makeCompleteInverseWitness(id, id, elements, elements);
      const iso = createIsomorphismFromWitness(witness);
      
      expect(iso).not.toBeNull();
      expect(iso!.forward).toBe(id);
      expect(iso!.backward).toBe(id);
    });

    it("should return null for invalid witness", () => {
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
      const witness = makeCompleteInverseWitness(id, notHom, elements, elements);
      const iso = createIsomorphismFromWitness(witness);
      
      expect(iso).toBeNull();
    });
  });

  describe("theorem4Characterization", () => {
    it("should implement Theorem 4 characterization", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const theorem4 = theorem4Characterization(id, elements, elements);
      
      const witness = theorem4(id);
      expect(witness.isCompleteIsomorphism).toBe(true);
    });
  });

  describe("canExtendToIsomorphism", () => {
    it("should recognize bijective homomorphisms", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      expect(canExtendToIsomorphism(id, elements, elements)).toBe(true);
    });

    it("should reject non-bijective homomorphisms", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      expect(canExtendToIsomorphism(constant, elements, elements)).toBe(false);
    });
  });

  describe("constructInverse", () => {
    it("should construct inverse for bijective homomorphism", () => {
      const id: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (x) => x
      };

      const elements = [0, 1];
      const inverse = constructInverse(id, elements, elements);
      
      expect(inverse).not.toBeNull();
      expect(inverse!.source).toBe(Z2);
      expect(inverse!.target).toBe(Z2);
      expect(inverse!.map(0)).toBe(0);
      expect(inverse!.map(1)).toBe(1);
    });

    it("should return null for non-bijective homomorphism", () => {
      const constant: Homomorphism<number, number> = {
        source: Z2,
        target: Z2,
        map: (_) => 0
      };

      const elements = [0, 1];
      const inverse = constructInverse(constant, elements, elements);
      
      expect(inverse).toBeNull();
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

      const witness = makeCompleteInverseWitness(id, id, elements, elements);
      expect(witness.isCompleteIsomorphism).toBe(true);
    });

    it("should work with scaling automorphism", () => {
      const Z4 = Zn(4);
      const elements = Z4.elements!;
      
      const scale3: Homomorphism<number, number> = {
        source: Z4,
        target: Z4,
        map: (x) => (3 * x) % 4
      };

      const witness = makeCompleteInverseWitness(scale3, scale3, elements, elements);
      expect(witness.isCompleteIsomorphism).toBe(true);
    });
  });
});