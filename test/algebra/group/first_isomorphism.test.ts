// Traceability: Smith §2.8 – First Isomorphism Theorem

import { describe, it, expect } from "vitest";
import { Cyclic } from "../../../src/algebra/group/Group";
import { hom } from "../../../src/algebra/group/Hom";
import { firstIsomorphism, kernel, image, quotientGroup } from "../../../src/algebra/group/FirstIso";

describe("First Isomorphism Theorem", () => {
  it("G/ker(f) ≅ im(f) for Z6 -> Z3", () => {
    const Z6 = Cyclic(6);
    const Z3 = Cyclic(3);
    
    // f: Z6 -> Z3, f(x) = x mod 3
    const f = hom(Z6, Z3, (x: number) => x % 3, "mod3");
    
    const { quotient, imageGrp, iso } = firstIsomorphism(f);
    
    // Check that quotient has 2 cosets (Z6/ker(f) has order 2)
    expect(quotient.elems.length).toBe(2);
    
    // Check that image has 3 elements (im(f) = Z3)
    expect(imageGrp.elems.length).toBe(3);
    
    // Check isomorphism properties
    expect(iso.leftInverse()).toBe(true);
    expect(iso.rightInverse()).toBe(true);
    
    // Check that the isomorphism preserves structure
    const coset0 = quotient.elems.find(c => c.members.includes(0))!;
    const coset3 = quotient.elems.find(c => c.members.includes(3))!;
    
    expect(iso.to.map(coset0)).toBe(0);
    expect(iso.to.map(coset3)).toBe(0);
  });
  
  it("kernel and image construction", () => {
    const Z6 = Cyclic(6);
    const Z3 = Cyclic(3);
    
    const f = hom(Z6, Z3, (x: number) => x % 3, "mod3");
    
    const { K } = kernel(f);
    const { im } = image(f);
    
    // ker(f) = {0, 3} (elements that map to 0)
    expect(K.elems).toEqual([0, 3]);
    
    // im(f) = {0, 1, 2} = Z3
    expect(im.elems).toEqual([0, 1, 2]);
  });
  
  it("quotient group construction", () => {
    const Z6 = Cyclic(6);
    const K = { ...Z6, elems: [0, 3], name: "K" }; // ker(f)
    
    const quotient = quotientGroup(Z6, K);
    
    // Should have 2 cosets: {0, 3} and {1, 4, 2, 5}
    expect(quotient.elems.length).toBe(2);
    
    // Check coset operations
    const coset0 = quotient.elems.find(c => c.members.includes(0))!;
    const coset1 = quotient.elems.find(c => c.members.includes(1))!;
    
    // coset0 * coset0 = coset0 (identity)
    expect(quotient.eq(quotient.op(coset0, coset0), coset0)).toBe(true);
    
    // coset1 * coset1 = coset0 (since 1+1=2, and 2 is in the same coset as 0)
    expect(quotient.eq(quotient.op(coset1, coset1), coset0)).toBe(true);
  });
});
