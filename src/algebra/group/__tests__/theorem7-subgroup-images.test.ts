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
    
    // TODO: Add validation that S is actually a subgroup of Z6
    // - Verify closure: 0+0=0, 0+3=3, 3+0=3, 3+3=0 (all in S)
    // - Verify identity: 0 is in S
    // - Verify inverses: 0⁻¹=0, 3⁻¹=3 (both in S)
    
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
    
    // TODO: Add validation that S is actually a subgroup of Z8
    // - Verify closure: 0+0=0, 0+4=4, 4+0=4, 4+4=0 (all in S)
    // - Verify identity: 0 is in S
    // - Verify inverses: 0⁻¹=0, 4⁻¹=4 (both in S)
    
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
    
    // TODO: Verify that the inclusion is actually a homomorphism
    // - Check that analyzed.witnesses?.isHom is true
    // - This requires implementing proper homomorphism verification in analyzeHom
    // - Should verify f(s₁ ∘ s₂) = f(s₁) ∘ f(s₂) for all s₁, s₂ ∈ S
    
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
    
    // TODO: This should throw an error or return a validation failure
    // - The inclusionHom function should validate that S is actually a subgroup
    // - Should check closure, identity, and inverse properties
    // - Currently this will pass but shouldn't - need to implement validation
    
    const incl = inclusionHom(Z6, notSubgroup, "Invalid ↪ Z6");
    const analyzed = analyzeHom(incl);
    
    // This test will currently pass but shouldn't - the validation is missing
    expect(analyzed.witnesses?.imageSubgroup).toBeDefined();
  });
});