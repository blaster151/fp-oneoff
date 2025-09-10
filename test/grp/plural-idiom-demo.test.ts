import { describe, it, expect } from "vitest";
import { FinGroup, FinGroupMor, makeFinGroup } from "../../src/cat/grp/FinGrp";
import { kernel, image, cosets, firstIso } from "../../src/cat/grp/first_iso";

// Define test groups
const Z8: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3,4,5,6,7],
  e: 0,
  op: (a,b) => (a + b) % 8,
  inv: a => (8 - (a % 8)) % 8,
  eq: (a,b) => a === b
});

const Z4: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3],
  e: 0,
  op: (a,b) => (a + b) % 4,
  inv: a => (4 - (a % 4)) % 4,
  eq: (a,b) => a === b
});

// Helper function to create homomorphisms
function hom<A, B>(src: FinGroup<A>, dst: FinGroup<B>, fn: (a: A) => B): FinGroupMor<A, B> {
  return { src, dst, run: fn };
}

describe("Plural Idiom in First Isomorphism Theorem", () => {
  it("demonstrates plural idiom: 'those elements' not 'the set of elements'", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    
    // PLURAL IDIOM: "those elements of G that map to identity in H"
    // Not: "the set of kernel elements"
    const ker = kernel(Z8, Z4, f);
    expect(ker).toEqual([0, 4]); // "those elements" that satisfy the condition
    
    // PLURAL IDIOM: "those elements of H that arise as f(g) for some g"  
    // Not: "the set of image elements"
    const img = image(Z8, f);
    expect(img).toEqual([0, 1, 2, 3]); // "those elements" that are hit by f
    
    // PLURAL IDIOM: "those cosets of the kernel"
    // Not: "the set of cosets"
    const cosetList = cosets(Z8, ker);
    expect(cosetList).toEqual([
      [0, 4], // coset of 0
      [1, 5], // coset of 1  
      [2, 6], // coset of 2
      [3, 7]  // coset of 3
    ]); // "those cosets" as collections of elements
    
    // PLURAL IDIOM: "send the coset of g to the element f(g)"
    // Not: "construct a set-theoretic bijection"
    const { phi } = firstIso(Z8, Z4, f);
    
    // The isomorphism is just: "this coset corresponds to that image element"
    expect(phi([0, 4])).toBe(0); // coset of 0 maps to f(0) = 0
    expect(phi([1, 5])).toBe(1); // coset of 1 maps to f(1) = 1
    expect(phi([2, 6])).toBe(2); // coset of 2 maps to f(2) = 2
    expect(phi([3, 7])).toBe(3); // coset of 3 maps to f(3) = 3
  });
  
  it("shows how plural idiom avoids 'set of elements' objects", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    
    // We work directly with "those elements" - no intermediate set objects needed
    const ker = kernel(Z8, Z4, f);
    const img = image(Z8, f);
    
    // The isomorphism is constructed by direct correspondence
    // "Send coset [a, a+4] to f(a)" - no set theory required
    const { cosets: cosetList, phi } = firstIso(Z8, Z4, f);
    
    // Verify the correspondence works for all cosets
    for (let i = 0; i < cosetList.length; i++) {
      const coset = cosetList[i];
      const representative = coset[0];
      const expectedImage = f.run(representative);
      const actualImage = phi(coset);
      
      expect(actualImage).toBe(expectedImage);
    }
    
    // This demonstrates: we never needed to construct "the set of all cosets"
    // or "the set of all image elements" - we just work with "those cosets"
    // and "those image elements" directly
  });
  
  it("illustrates the convergence of singular and plural idioms", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    
    // SINGULAR IDIOM: "The kernel is a subset of G"
    // PLURAL IDIOM: "The kernel consists of those elements of G that..."
    // Both lead to the same computation:
    const ker = kernel(Z8, Z4, f);
    expect(ker).toEqual([0, 4]);
    
    // SINGULAR IDIOM: "The image is a subset of H"  
    // PLURAL IDIOM: "The image consists of those elements of H that..."
    // Both lead to the same computation:
    const img = image(Z8, f);
    expect(img).toEqual([0, 1, 2, 3]);
    
    // The key insight: both idioms converge in practice
    // They both let you define Grp, build morphisms, test laws, and prove theorems
    // The plural idiom just postpones committing to a particular foundation
    // while still letting us manipulate things concretely
  });
});
