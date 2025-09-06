import { describe, it, expect } from "vitest";
import { Z2, TwoElt } from "../FiniteGroups";
import { 
  GroupHom, 
  isHomomorphism, 
  isIsomorphismFinite,
  isMonomorphism,
  isEpimorphism,
  isomorphismEquivalenceWitness,
  isEquivalenceRelation,
  deriveHomomorphismWitness,
  deriveGroupWitness
} from "../Group";
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

  // --- Categorical Characterizations ---

  it("Theorem 5: Monomorphism = injective homomorphism", () => {
    // Identity map is injective (hence monomorphism)
    const idHom = hom(Z2, Z2, x => x);
    expect(isMonomorphism(idHom)).toBe(true);
    
    // Trivial map (everything to identity) is not injective (hence not monomorphism)
    const trivialHom = hom(Z2, Z2, _ => "e");
    expect(isMonomorphism(trivialHom)).toBe(false);
  });

  it("Epimorphism = surjective homomorphism", () => {
    // Identity map is surjective (hence epimorphism)
    const idHom = hom(Z2, Z2, x => x);
    expect(isEpimorphism(idHom)).toBe(true);
    
    // Trivial map (everything to identity) is not surjective (hence not epimorphism)
    const trivialHom = hom(Z2, Z2, _ => "e");
    expect(isEpimorphism(trivialHom)).toBe(false);
  });

  // --- Equivalence Relation Properties ---

  it("Theorem 3: Isomorphism is an equivalence relation", () => {
    const witness = isomorphismEquivalenceWitness(Z2);
    
    // Reflexive: identity isomorphism
    const idIso = iso(
      hom(Z2, Z2, x => x),
      hom(Z2, Z2, x => x),
      (b: TwoElt) => Z2.eq(b, b),
      (a: TwoElt) => Z2.eq(a, a)
    );
    expect(witness.reflexive(idIso)).toBe(true);
    
    // Symmetric: if f is iso, then f^{-1} is iso
    const f = hom(Z2, Z2, x => x === "e" ? "j" : "e"); // swap elements
    const fInv = hom(Z2, Z2, x => x === "e" ? "j" : "e"); // same map (self-inverse)
    const swapIso = iso(f, fInv, (b: TwoElt) => Z2.eq(f.map(fInv.map(b)), b), (a: TwoElt) => Z2.eq(fInv.map(f.map(a)), a));
    expect(witness.symmetric(swapIso, swapIso)).toBe(true);
    
    // Transitive: composition of isomorphisms is isomorphism
    expect(witness.transitive(idIso, swapIso, swapIso)).toBe(true);
  });

  it("Generic equivalence relation infrastructure works", () => {
    const elements = ["e", "j"] as const;
    const witness = isEquivalenceRelation((a, b) => a === b, elements);
    
    // Reflexive: a ~ a
    expect(witness.reflexive("e")).toBe(true);
    expect(witness.reflexive("j")).toBe(true);
    
    // Symmetric: a ~ b => b ~ a
    expect(witness.symmetric("e", "j")).toBe(true); // e ≠ j, so condition is vacuously true
    expect(witness.symmetric("e", "e")).toBe(true); // e = e, so e = e
    
    // Transitive: a ~ b && b ~ c => a ~ c
    expect(witness.transitive("e", "j", "e")).toBe(true); // e ≠ j, so condition is vacuously true
    expect(witness.transitive("e", "e", "e")).toBe(true); // e = e && e = e => e = e
  });

  it("Isomorphism characterization: bijective homomorphism", () => {
    // Identity is bijective (injective + surjective)
    const idHom = hom(Z2, Z2, x => x);
    expect(isMonomorphism(idHom)).toBe(true);
    expect(isEpimorphism(idHom)).toBe(true);
    
    // Trivial map is neither injective nor surjective
    const trivialHom = hom(Z2, Z2, _ => "e");
    expect(isMonomorphism(trivialHom)).toBe(false);
    expect(isEpimorphism(trivialHom)).toBe(false);
  });

  // --- Witness Pack System ---

  it("Auto-derivation: homomorphism witness pack", () => {
    // Identity homomorphism - should be all properties
    const idHom = hom(Z2, Z2, x => x);
    const idWitness = deriveHomomorphismWitness(idHom);
    expect(idWitness.isHomomorphism).toBe(true);
    expect(idWitness.isMonomorphism).toBe(true);
    expect(idWitness.isEpimorphism).toBe(true);
    expect(idWitness.isIsomorphism).toBe(true);
    
    // Trivial homomorphism - should be none of the categorical properties
    const trivialHom = hom(Z2, Z2, _ => "e");
    const trivialWitness = deriveHomomorphismWitness(trivialHom);
    expect(trivialWitness.isHomomorphism).toBe(true); // still a homomorphism
    expect(trivialWitness.isMonomorphism).toBe(false);
    expect(trivialWitness.isEpimorphism).toBe(false);
    expect(trivialWitness.isIsomorphism).toBe(false);
  });

  it("Auto-derivation: group witness pack", () => {
    // Z2 should be a valid abelian group of order 2
    const z2Witness = deriveGroupWitness(Z2);
    expect(z2Witness.isGroup).toBe(true);
    expect(z2Witness.isAbelian).toBe(true);
    expect(z2Witness.order).toBe(2);
    
    // Z+ should be infinite
    const zPlusWitness = deriveGroupWitness(Zplus);
    expect(zPlusWitness.isGroup).toBe(true);
    expect(zPlusWitness.isAbelian).toBe(true);
    expect(zPlusWitness.order).toBe("infinite");
  });

  it("Witness pack integration: complete categorical analysis", () => {
    // Test the complete pipeline: group properties + homomorphism properties
    const groupWitness = deriveGroupWitness(Z2);
    const homWitness = deriveHomomorphismWitness(hom(Z2, Z2, x => x));
    
    // Both should validate the structure
    expect(groupWitness.isGroup).toBe(true);
    expect(homWitness.isIsomorphism).toBe(true);
    
    // This demonstrates the witness pack system working together
    // to provide complete categorical analysis
    console.log("Group witness:", groupWitness);
    console.log("Homomorphism witness:", homWitness);
  });
});