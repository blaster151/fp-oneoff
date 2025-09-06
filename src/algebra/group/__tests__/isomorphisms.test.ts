import { describe, it, expect } from "vitest";
import { Z2, TwoElt } from "../FiniteGroups";
import { GroupHom, isHomomorphism, isIsomorphismFinite } from "../Group";
import { hom, iso } from "../iso/Constructors";
import { Zplus, autoZ_id, autoZ_neg, Qplus } from "../NumberGroups";
import { Rational, one, fromBigInt, make, eq as qEq, mul as qMul, zero as qZero } from "../../../number/Rational";

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

describe("Group Isomorphisms and Automorphisms", () => {
  it("Z2 iso Z2 (two-object groups are isomorphic)", () => {
    expect(isHomomorphism(f)).toBe(true);
    expect(isHomomorphism(g)).toBe(true);
    expect(isIsomorphismFinite(isoZ2)).toBe(true);
  });

  // (2) Automorphisms of (Z,+): id and negation are homs with two-sided inverse (each other)
  const homZ_id = hom(Zplus, Zplus, autoZ_id);
  const homZ_neg = hom(Zplus, Zplus, autoZ_neg);

  const leftInvZ = (z: bigint) => Zplus.eq(homZ_id.map(homZ_id.map(z)), z); // trivial, shows pattern
  const rightInvZ = leftInvZ;

  it("Aut(Z,+): id is hom; neg is hom", () => {
    expect(isHomomorphism(homZ_id)).toBe(true);
    expect(isHomomorphism(homZ_neg)).toBe(true);
  });

  // (3) Automorphisms of (Q,+): scaling by nonzero q is a hom; inverse scales by q^{-1}
  const two = fromBigInt(2n);
  const three = fromBigInt(3n);
  const q = make(3n, 2n); // 3/2
  const qInv = make(2n, 3n);
  const scaleQ = hom(Qplus, Qplus, x => qMul(q, x));
  const scaleQInv = hom(Qplus, Qplus, x => qMul(qInv, x));

  const leftInvQ = (y: Rational) => qEq(scaleQ.map(scaleQInv.map(y)), y);
  const rightInvQ = (x: Rational) => qEq(scaleQInv.map(scaleQ.map(x)), x);

  it("Aut(Q,+): scaling by nonzero rational is a hom with a homomorphic inverse", () => {
    expect(isHomomorphism(scaleQ)).toBe(true);
    expect(isHomomorphism(scaleQInv)).toBe(true);
    // iso characterization by two-sided hom inverse (Theorem 4)
    expect(leftInvQ(make(5n,7n))).toBe(true);
    expect(rightInvQ(make(-9n,2n))).toBe(true);
  });
});