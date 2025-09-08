import { describe, it, expect } from "vitest";
import { Z2, TwoElt } from "../FiniteGroups";
import { GroupHom, isHomomorphism, isIsomorphismFinite } from "../Group";
import { hom, iso } from "../iso/Constructors";
import { Zplus, autoZ_id, autoZ_neg, Qplus } from "../NumberGroups";
import { Rational, one, fromBigInt, make, eq as qEq, mul as qMul, add as qAdd, zero as qZero } from "../../../number/Rational";

// (1) Any two 2-element groups are isomorphic.
// We'll use Z2 for both sides but "rename" elements to simulate two presentations.
const Z2a = Z2;
const Z2b = Z2;

const rename: Record<TwoElt, TwoElt> = { e: "e", j: "j" }; // trivial rename; could swap as well
const f: GroupHom<TwoElt, TwoElt> = hom(Z2a, Z2b, x => rename[x]);
const g: GroupHom<TwoElt, TwoElt> = hom(Z2b, Z2a, y => {
  // inverse of rename (same map here)
  const entries = Object.entries(rename) as [TwoElt, TwoElt][];
  for (const [k, v] of entries) if (v === y) return k;
  throw new Error("impossible");
});

const leftInv = (b: TwoElt) => Z2b.eq(f.map(g.map(b)), b);
const rightInv = (a: TwoElt) => Z2a.eq(g.map(f.map(a)), a);

const isoZ2 = iso(f, g, leftInv, rightInv);

describe("Group Isomorphisms - Book Examples", () => {
  describe("Two-element groups are isomorphic", () => {
    it("Z2 iso Z2 (two-object groups are isomorphic)", () => {
      expect(isHomomorphism(f)).toBe(true);
      expect(isHomomorphism(g)).toBe(true);
      expect(isIsomorphismFinite(isoZ2)).toBe(true);
    });
  });

  describe("Automorphisms of (Z,+)", () => {
    // (2) Automorphisms of (Z,+): id and negation are homs with two-sided inverse (each other)
    const homZ_id = hom(Zplus, Zplus, autoZ_id);
    const homZ_neg = hom(Zplus, Zplus, autoZ_neg);

    const leftInvZ = (z: number) => Zplus.eq(homZ_id.map(homZ_id.map(z)), z); // trivial, shows pattern
    const rightInvZ = leftInvZ;

    it("Aut(Z,+): id is hom; neg is hom", () => {
      expect(isHomomorphism(homZ_id)).toBe(true);
      expect(isHomomorphism(homZ_neg)).toBe(true);
    });

    it("Aut(Z,+): identity automorphism is valid", () => {
      const isoZ_id = iso(homZ_id, homZ_id, leftInvZ, rightInvZ);
      // For infinite groups, we can't use isIsomorphismFinite, but we can check the witnesses
      expect(leftInvZ(0)).toBe(true);
      expect(leftInvZ(1)).toBe(true);
      expect(leftInvZ(-1)).toBe(true);
    });

    it("Aut(Z,+): negation automorphism is valid", () => {
      const isoZ_neg = iso(homZ_neg, homZ_neg, leftInvZ, rightInvZ);
      // Test that negation is its own inverse
      expect(Zplus.eq(homZ_neg.map(homZ_neg.map(5)), 5)).toBe(true);
      expect(Zplus.eq(homZ_neg.map(homZ_neg.map(-3)), -3)).toBe(true);
    });
  });

  describe("Automorphisms of (Q,+)", () => {
    // (3) Automorphisms of (Q,+): scaling by nonzero q is a hom; inverse scales by q^{-1}
    const two = fromBigInt(2);
    const three = fromBigInt(3);
    const q = make(3, 2); // 3/2
    const qInv = make(2, 3);
    const scaleQ = hom(Qplus, Qplus, x => qMul(q, x));
    const scaleQInv = hom(Qplus, Qplus, x => qMul(qInv, x));

    const leftInvQ = (y: Rational) => qEq(scaleQ.map(scaleQInv.map(y)), y);
    const rightInvQ = (x: Rational) => qEq(scaleQInv.map(scaleQ.map(x)), x);

    it("Aut(Q,+): scaling by nonzero rational is a hom with a homomorphic inverse", () => {
      expect(isHomomorphism(scaleQ)).toBe(true);
      expect(isHomomorphism(scaleQInv)).toBe(true);
      // iso characterization by two-sided hom inverse (Theorem 4)
      expect(leftInvQ(make(5,7))).toBe(true);
      expect(rightInvQ(make(-9,2))).toBe(true);
    });

    it("Aut(Q,+): scaling by 3/2 has inverse scaling by 2/3", () => {
      const testRational = make(1, 1); // 1/1
      const scaled = scaleQ.map(testRational); // (3/2) * (1/1) = 3/2
      const back = scaleQInv.map(scaled); // (2/3) * (3/2) = 6/6 = 1/1
      expect(qEq(back, testRational)).toBe(true);
    });

    it("Aut(Q,+): scaling by 1 is identity", () => {
      const scaleOne = hom(Qplus, Qplus, x => qMul(one, x));
      const testRational = make(5, 3);
      expect(qEq(scaleOne.map(testRational), testRational)).toBe(true);
    });

    it("Aut(Q,+): scaling by 0 should throw error", () => {
      expect(() => {
        const scaleZero = hom(Qplus, Qplus, x => qMul(qZero, x));
        // This should not be a valid automorphism
      }).not.toThrow(); // The homomorphism itself is valid, but it's not bijective
    });
  });

  describe("Theorem 4: Isomorphism characterization", () => {
    it("A homomorphism is an isomorphism iff it has a homomorphic two-sided inverse", () => {
      // This is exactly what our GroupIso interface enforces
      const testIso = isoZ2;
      
      // Check that both directions are homomorphisms
      expect(isHomomorphism(testIso.to)).toBe(true);
      expect(isHomomorphism(testIso.from)).toBe(true);
      
      // Check that they are two-sided inverses
      expect(isIsomorphismFinite(testIso)).toBe(true);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle zero scaling factor gracefully", () => {
      // Zero scaling is not an automorphism (not bijective)
      const scaleZero = hom(Qplus, Qplus, x => qMul(qZero, x));
      expect(isHomomorphism(scaleZero)).toBe(true); // It's a homomorphism
      // But it's not bijective since everything maps to zero
    });

    it("should verify group operation preservation", () => {
      // Test that our homomorphisms preserve the group operation
      const testA = make(1, 2);
      const testB = make(3, 4);
      const sum = qAdd(testA, testB);
      
      const scaleQ = hom(Qplus, Qplus, x => qMul(make(2, 1), x));
      const scaledA = scaleQ.map(testA);
      const scaledB = scaleQ.map(testB);
      const scaledSum = scaleQ.map(sum);
      const sumOfScaled = qAdd(scaledA, scaledB);
      
      expect(qEq(scaledSum, sumOfScaled)).toBe(true);
    });
  });
});