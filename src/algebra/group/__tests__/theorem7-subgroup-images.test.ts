import { describe, it, expect } from "vitest";
import { Cyclic } from "../Group";
import { inclusionHom, analyzeHom } from "../Hom";

/**
 * Theorem 7: Subgroups as Images of Homomorphisms
 * 
 * Test that inclusion homomorphisms have the correct image (the subgroup itself).
 * This verifies the bidirectional bridge: subgroups ↔ homomorphism images.
 */
describe("Theorem 7: Subgroups as Images of Homomorphisms", () => {
  it("Inclusion hom image = subgroup for Z6 with ⟨3⟩", () => {
    const Z6 = Cyclic(6);
    
    // Create subgroup S = ⟨3⟩ = {0, 3}
    const S: typeof Z6 = {
      elems: [0, 3],
      op: Z6.op,
      id: Z6.id,
      inv: Z6.inv,
      eq: Z6.eq,
      name: "⟨3⟩"
    };
    
    // Validate that S is actually a subgroup of Z6
    // Verify identity: 0 is in S
    expect(S.elems).toContain(0);
    
    // Verify closure: for all a,b ∈ S, a+b ∈ S
    for (const a of S.elems) {
      for (const b of S.elems) {
        const ab = Z6.op(a, b);
        expect(S.elems).toContain(ab);
      }
    }
    
    // Verify inverses: for all a ∈ S, a⁻¹ ∈ S
    for (const a of S.elems) {
      const inv_a = Z6.inv(a);
      expect(S.elems).toContain(inv_a);
    }
    
    const incl = inclusionHom(Z6, S, "⟨3⟩ ↪ Z6");
    const analyzed = analyzeHom(incl);
    
    // The image should be exactly the subgroup S
    expect(analyzed.witnesses?.imageSubgroup).toBeDefined();
    const imageElems = analyzed.witnesses!.imageSubgroup!.elems.sort();
    expect(imageElems).toEqual([0, 3]);
  });

  it("Inclusion hom image = subgroup for Z8 with ⟨4⟩", () => {
    const Z8 = Cyclic(8);
    
    // Create subgroup S = ⟨4⟩ = {0, 4}
    const S: typeof Z8 = {
      elems: [0, 4],
      op: Z8.op,
      id: Z8.id,
      inv: Z8.inv,
      eq: Z8.eq,
      name: "⟨4⟩"
    };
    
    // Validate that S is actually a subgroup of Z8
    // Verify identity: 0 is in S
    expect(S.elems).toContain(0);
    
    // Verify closure: for all a,b ∈ S, a+b ∈ S
    for (const a of S.elems) {
      for (const b of S.elems) {
        const ab = Z8.op(a, b);
        expect(S.elems).toContain(ab);
      }
    }
    
    // Verify inverses: for all a ∈ S, a⁻¹ ∈ S
    for (const a of S.elems) {
      const inv_a = Z8.inv(a);
      expect(S.elems).toContain(inv_a);
    }
    
    const incl = inclusionHom(Z8, S, "⟨4⟩ ↪ Z8");
    const analyzed = analyzeHom(incl);
    
    // The image should be exactly the subgroup S
    expect(analyzed.witnesses?.imageSubgroup).toBeDefined();
    const imageElems = analyzed.witnesses!.imageSubgroup!.elems.sort();
    expect(imageElems).toEqual([0, 4]);
  });

  it("Inclusion hom preserves homomorphism properties", () => {
    const Z4 = Cyclic(4);
    
    // Create subgroup S = ⟨2⟩ = {0, 2}
    const S: typeof Z4 = {
      elems: [0, 2],
      op: Z4.op,
      id: Z4.id,
      inv: Z4.inv,
      eq: Z4.eq,
      name: "⟨2⟩"
    };
    
    const incl = inclusionHom(Z4, S, "⟨2⟩ ↪ Z4");
    const analyzed = analyzeHom(incl);
    
    // Verify that the inclusion is actually a homomorphism
    // Check that analyzed.witnesses?.isHom is true
    expect(analyzed.witnesses?.isHom).toBe(true);
    
    // Manually verify homomorphism property: f(s₁ ∘ s₂) = f(s₁) ∘ f(s₂) for all s₁, s₂ ∈ S
    for (const s1 of S.elems) {
      for (const s2 of S.elems) {
        const s1s2 = S.op(s1, s2);  // s₁ ∘ s₂ in S
        const f_s1s2 = incl.map(s1s2);  // f(s₁ ∘ s₂)
        const f_s1 = incl.map(s1);  // f(s₁)
        const f_s2 = incl.map(s2);  // f(s₂)
        const f_s1_f_s2 = Z4.op(f_s1, f_s2);  // f(s₁) ∘ f(s₂) in Z4
        expect(Z4.eq(f_s1s2, f_s1_f_s2)).toBe(true);
      }
    }
    
    expect(analyzed.witnesses?.imageSubgroup).toBeDefined();
    const imageElems = analyzed.witnesses!.imageSubgroup!.elems.sort();
    expect(imageElems).toEqual([0, 2]);
  });

  it("Error case: non-subgroup should be caught", () => {
    const Z6 = Cyclic(6);
    
    // Create a set that is NOT a subgroup: {0, 1, 2}
    // This is not closed under addition: 1+2=3 ∉ {0,1,2}
    const notSubgroup: typeof Z6 = {
      elems: [0, 1, 2],
      op: Z6.op,
      id: Z6.id,
      inv: Z6.inv,
      eq: Z6.eq,
      name: "Not a subgroup"
    };
    
    // This should throw an error because notSubgroup is not actually a subgroup
    // The inclusionHom function validates that S is actually a subgroup
    expect(() => {
      inclusionHom(Z6, notSubgroup, "Invalid ↪ Z6");
    }).toThrow(/Invalid subgroup/);
  });
});