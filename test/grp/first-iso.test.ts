import { describe, it, expect } from "vitest";
import { FinGroup, FinGroupMor, makeFinGroup } from "../../src/cat/grp/FinGrp";
import { firstIso, kernel, image } from "../../src/cat/grp/first_iso";

// Define the test groups
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

describe("First Isomorphism Theorem (finite)", () => {
  it("Z8 → Z4 mod-4 map factors via Z8/ker ≅ im", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    const K = kernel(Z8, Z4, f);                // should be {0,4}
    const img = image(Z8, f);                   // should be all of Z4

    // Get the factorization from firstIso
    const { cosets, img: imgSet, phi } = firstIso(Z8, Z4, f);

    // Verify the factorization: phi(coset) should equal f(representative)
    for (const coset of cosets) {
      const representative = coset[0];
      const phiValue = phi(coset);
      const fValue = f.run(representative);
      expect(phiValue).toEqual(fValue);
    }

    // φ is bijective: check that each coset maps to a unique image element
    const phiValues = cosets.map(c => phi(c));
    const uniqueValues = new Set(phiValues);
    expect(uniqueValues.size).toBe(imgSet.length);
    
    // All image elements should be hit
    for (const imgElement of imgSet) {
      expect(phiValues).toContain(imgElement);
    }
  });
});
