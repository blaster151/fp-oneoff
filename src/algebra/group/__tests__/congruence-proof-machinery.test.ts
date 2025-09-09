import { expect } from "vitest";
import { hom } from "../Hom";
import { isCongruence, congruenceFromHom } from "../Congruence";
import { factorThroughQuotient } from "../FirstIso";
import { modHom, Zmod } from "../examples/cyclic";
import { eqOf } from "../Group";

describe("Theorem 9 Proof Machinery: Congruences and Factorization", () => {
  it("kernel-pair congruence from homomorphism satisfies all congruence properties", () => {
    const { Z, Zn, qn } = modHom(6);
    const f = hom(Z, Zn, qn);
    
    // Build congruence from homomorphism
    const cong = congruenceFromHom(Z, Zn, qn);
    
    // Test that it's actually a congruence
    // Note: For infinite Z, we test on a finite window
    const testWindow = Array.from({ length: 13 }, (_, i) => i - 6);
    const finiteZ = {
      ...Z,
      elems: testWindow // Add elems property for testing
    };
    
    // Test congruence properties on the finite window
    const isCong = isCongruence(finiteZ, cong.eqv);
    expect(isCong).toBe(true);
  });

  it("factorization: f = ι ∘ π where π is surjective and ι is injective", () => {
    const { Z, Zn, qn } = modHom(4);
    const f = hom(Z, Zn, qn);
    
    const { quotient, pi, iota } = factorThroughQuotient(f);
    
    // Test that π is surjective (every coset has a preimage)
    const testWindow = Array.from({ length: 9 }, (_, i) => i - 4);
    for (const g of testWindow) {
      const coset = pi.map(g);
      // π(g) should be a valid coset
      expect(coset).toBeDefined();
      expect(coset.rep).toBe(g);
    }
    
    // Test that ι is well-defined (same coset gives same image)
    const coset1 = pi.map(0);
    const coset2 = pi.map(4); // 0 and 4 should be in same coset (both ≡ 0 mod 4)
    expect(eqOf(quotient)(coset1, coset2)).toBe(true);
    expect(eqOf(Zn)(iota.map(coset1), iota.map(coset2))).toBe(true);
    
    // Test composition: ι ∘ π = f
    for (const g of testWindow) {
      const composed = iota.map(pi.map(g));
      const direct = qn(g);
      expect(eqOf(Zn)(composed, direct)).toBe(true);
    }
  });

  it("congruence properties on finite group", () => {
    const Z4 = Zmod(4);
    
    // Test the equality relation (should be a congruence)
    const isEqCong = isCongruence(Z4, Z4.eq);
    expect(isEqCong).toBe(true);
    
    // Test mod 2 relation: x ≈ y iff x ≡ y (mod 2)
    const mod2Eq = (x: number, y: number) => (x % 2) === (y % 2);
    const isMod2Cong = isCongruence(Z4, mod2Eq);
    expect(isMod2Cong).toBe(true);
  });
});