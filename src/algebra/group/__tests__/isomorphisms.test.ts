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
  deriveGroupWitness,
  InverseWitness,
  makeInverseWitness,
  isIsomorphismByInverse,
  hasInverse,
  createIsomorphismLawChecker,
  checkIsInverse,
  tryBuildInverse,
  createProofWorkflow
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

  // --- Theorem 4: Two-sided Inverse Characterization ---

  it("Theorem 4: Inverse witness system", () => {
    // Identity isomorphism with explicit inverse witness
    const idHom = hom(Z2, Z2, x => x);
    const idInv = hom(Z2, Z2, x => x);
    
    const inverseWitness = makeInverseWitness(idHom, idInv, Z2.elements, Z2.elements);
    expect(inverseWitness.leftIdentity).toBe(true);
    expect(inverseWitness.rightIdentity).toBe(true);
    expect(isIsomorphismByInverse(inverseWitness)).toBe(true);
  });

  it("Theorem 4: Non-inverse witness fails", () => {
    // Try to use identity as inverse of swap - should fail
    const swapHom = hom(Z2, Z2, x => x === "e" ? "j" : "e");
    const idHom = hom(Z2, Z2, x => x); // wrong inverse
    
    const inverseWitness = makeInverseWitness(swapHom, idHom, Z2.elements, Z2.elements);
    expect(inverseWitness.leftIdentity).toBe(false); // g(f(e)) = id(swap(e)) = id(j) = j ≠ e
    expect(inverseWitness.rightIdentity).toBe(false);
    expect(isIsomorphismByInverse(inverseWitness)).toBe(false);
  });

  it("Theorem 4: Correct inverse witness succeeds", () => {
    // Use identity isomorphism (which is definitely a homomorphism)
    const idHom = hom(Z2, Z2, x => x);
    const idInv = hom(Z2, Z2, x => x); // same map
    
    // First check that the homomorphisms are valid
    expect(isHomomorphism(idHom)).toBe(true);
    expect(isHomomorphism(idInv)).toBe(true);
    
    const inverseWitness = makeInverseWitness(idHom, idInv, Z2.elements, Z2.elements);
    expect(inverseWitness.leftIdentity).toBe(true);
    expect(inverseWitness.rightIdentity).toBe(true);
    expect(isIsomorphismByInverse(inverseWitness)).toBe(true);
  });

  it("Generic hasInverse function works", () => {
    // Test the generic categorical inverse checker
    const f = (x: TwoElt) => x === "e" ? "j" : "e";
    const g = (x: TwoElt) => x === "e" ? "j" : "e"; // same function (self-inverse)
    
    const result = hasInverse(f, g, Z2.elements, Z2.elements, Z2.eq, Z2.eq);
    expect(result).toBe(true);
    
    // Test with wrong inverse
    const id = (x: TwoElt) => x;
    const wrongResult = hasInverse(f, id, Z2.elements, Z2.elements, Z2.eq, Z2.eq);
    expect(wrongResult).toBe(false);
  });

  it("Law checker system works", () => {
    // Create law checker for Z2
    const lawChecker = createIsomorphismLawChecker(Z2.elements, Z2.elements);
    
    // Test with correct inverse (identity)
    const idHom = hom(Z2, Z2, x => x);
    const idInv = hom(Z2, Z2, x => x);
    
    const witness = lawChecker.checkInverse(idHom, idInv);
    expect(lawChecker.validateIsomorphism(witness)).toBe(true);
    
    // Test with wrong inverse (using a non-homomorphism)
    const swapHom = hom(Z2, Z2, x => x === "e" ? "j" : "e");
    const wrongWitness = lawChecker.checkInverse(swapHom, idHom);
    expect(lawChecker.validateIsomorphism(wrongWitness)).toBe(false);
  });

  it("Theorem 4: Pivot point to categorical isomorphism", () => {
    // This test demonstrates how Theorem 4 bridges Grp and general Cat
    // by focusing on invertibility rather than bijectivity
    
    const idHom = hom(Z2, Z2, x => x);
    const idInv = hom(Z2, Z2, x => x);
    
    // The key insight: we don't check injectivity/surjectivity directly
    // Instead, we check the round-trip laws: g(f(a)) = a and f(g(b)) = b
    const witness = makeInverseWitness(idHom, idInv, Z2.elements, Z2.elements);
    
    // This characterization generalizes to any category
    expect(witness.leftIdentity).toBe(true);  // g ∘ f = id_A
    expect(witness.rightIdentity).toBe(true); // f ∘ g = id_B
    
    // The isomorphism property follows from the inverse property
    expect(isIsomorphismByInverse(witness)).toBe(true);
    
    console.log("Theorem 4 witness:", witness);
    console.log("This witness structure generalizes to any category!");
  });

  // --- Proof-Driven Isomorphism Checking ---

  it("Proof-driven: checkIsInverse encodes the proof steps", () => {
    // Test with identity isomorphism
    const idHom = hom(Z2, Z2, x => x);
    const idInv = hom(Z2, Z2, x => x);
    
    // This should pass all proof steps:
    // Step 1: g preserves operation (homomorphism law)
    // Step 2: left and right identity laws (round-trips)
    const result = checkIsInverse(idHom, idInv, Z2.elements, Z2.elements);
    expect(result).toBe(true);
    
    // Test with wrong inverse (should fail)
    const wrongInv = hom(Z2, Z2, _ => "e"); // constant map
    const wrongResult = checkIsInverse(idHom, wrongInv, Z2.elements, Z2.elements);
    expect(wrongResult).toBe(false);
  });

  it("Proof-driven: tryBuildInverse automatically constructs inverse", () => {
    // Test with identity homomorphism
    const idHom = hom(Z2, Z2, x => x);
    const constructedInverse = tryBuildInverse(idHom, Z2.elements, Z2.elements);
    
    expect(constructedInverse).not.toBeNull();
    expect(constructedInverse!.map("e")).toBe("e");
    expect(constructedInverse!.map("j")).toBe("j");
    
    // Test with non-injective homomorphism (should fail)
    const constantHom = hom(Z2, Z2, _ => "e");
    const failedInverse = tryBuildInverse(constantHom, Z2.elements, Z2.elements);
    expect(failedInverse).toBeNull();
  });

  it("Proof-driven: complete proof workflow mechanically derives isomorphism", () => {
    // Create proof workflow for identity homomorphism
    const idHom = hom(Z2, Z2, x => x);
    const workflow = createProofWorkflow(idHom, Z2.elements, Z2.elements);
    
    // Step 1: Attempt inverse construction
    const constructedInverse = workflow.attemptInverseConstruction();
    expect(constructedInverse).not.toBeNull();
    
    // Step 2: Validate the proof
    const proofValid = workflow.validateProof(constructedInverse!);
    expect(proofValid).toBe(true);
    
    // Step 3: Check if it's an isomorphism
    expect(workflow.isIsomorphism).toBe(true);
    
    // Step 4: Examine the proof steps
    const proof = workflow.proof;
    expect(proof.step1_inverseExists).toBe(true);
    expect(proof.step2_inverseIsHomomorphism).toBe(true);
    expect(proof.step3_roundTripsValid).toBe(true);
    
    console.log("Proof workflow result:", {
      constructedInverse: constructedInverse?.map,
      proofValid,
      isIsomorphism: workflow.isIsomorphism,
      proof
    });
  });

  it("Proof-driven: workflow fails for non-isomorphism", () => {
    // Create proof workflow for constant homomorphism (not an isomorphism)
    const constantHom = hom(Z2, Z2, _ => "e");
    const workflow = createProofWorkflow(constantHom, Z2.elements, Z2.elements);
    
    // Step 1: Attempt inverse construction (should fail)
    const constructedInverse = workflow.attemptInverseConstruction();
    expect(constructedInverse).toBeNull();
    
    // Step 2: Check proof steps
    const proof = workflow.proof;
    expect(proof.step1_inverseExists).toBe(false);
    expect(proof.step2_inverseIsHomomorphism).toBe(false);
    expect(proof.step3_roundTripsValid).toBe(false);
    
    // Step 3: Should not be an isomorphism
    expect(workflow.isIsomorphism).toBe(false);
    
    console.log("Failed proof workflow:", {
      constructedInverse,
      isIsomorphism: workflow.isIsomorphism,
      proof
    });
  });

  it("Proof-driven: demonstrates the proof flow in code", () => {
    // This test demonstrates the complete proof flow:
    // Forward: if f iso, check g preserves laws
    // Converse: if g exists and is homomorphic, f iso
    
    const idHom = hom(Z2, Z2, x => x);
    const workflow = createProofWorkflow(idHom, Z2.elements, Z2.elements);
    
    // Forward direction: if f is isomorphism, then g should preserve laws
    const constructedInverse = workflow.attemptInverseConstruction();
    expect(constructedInverse).not.toBeNull();
    
    // Check that g preserves the operation (homomorphism law)
    const preservesOp = Z2.elements.every((x) =>
      Z2.elements.every((y) => {
        const lhs = constructedInverse!.map(Z2.op(x, y));
        const rhs = Z2.op(constructedInverse!.map(x), constructedInverse!.map(y));
        return Z2.eq(lhs, rhs);
      })
    );
    expect(preservesOp).toBe(true);
    
    // Converse direction: if g exists and is homomorphic, then f is iso
    const proofValid = workflow.validateProof(constructedInverse!);
    expect(proofValid).toBe(true);
    expect(workflow.isIsomorphism).toBe(true);
    
    console.log("Complete proof flow demonstrated:");
    console.log("1. Constructed inverse:", constructedInverse?.map);
    console.log("2. Preserves operation:", preservesOp);
    console.log("3. Proof valid:", proofValid);
    console.log("4. Is isomorphism:", workflow.isIsomorphism);
  });
});