import { ZmodAdd } from "../examples";
import { hom as groupHom, analyzeHom, secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../Hom";
import { firstIsomorphism } from "../FirstIso";
import { quotientGroup } from "../Quotient";

describe("First Isomorphism Theorem (finite examples)", () => {
  test("Z4 --mod2--> Z2  ⇒  Z4/ker ≅ im ≅ Z2", () => {
    const Z4 = ZmodAdd(4);
    const Z2 = ZmodAdd(2);
    const f = analyzeHom(groupHom(Z4, Z2, x => x % 2, "mod2"));

    const iso = firstIsomorphism(f);
    expect(iso.leftInverse).toBe(true);
    expect(iso.rightInverse).toBe(true);
    // sizes: |Z4/ker| = |im f| = 2
    expect(iso.source.elems.length).toBe(2);
    expect(iso.target.elems.length).toBe(2);
  });

  test("Z6 --mod3--> Z3  ⇒  Z6/ker ≅ im ≅ Z3", () => {
    const Z6 = ZmodAdd(6);
    const Z3 = ZmodAdd(3);
    const f = analyzeHom(groupHom(Z6, Z3, x => x % 3, "mod3"));

    const iso = firstIsomorphism(f);
    expect(iso.leftInverse).toBe(true);
    expect(iso.rightInverse).toBe(true);
    expect(iso.source.elems.length).toBe(3);
    expect(iso.target.elems.length).toBe(3);
  });

  test("well-definedness safety check: f(x) = f(c.rep) for all x in coset c", () => {
    const Z4 = ZmodAdd(4);
    const Z2 = ZmodAdd(2);
    const f = analyzeHom(groupHom(Z4, Z2, x => x % 2, "mod2"));
    
    const K = f.witnesses!.kernelSubgroup!;
    const Q = quotientGroup(Z4, K);
    
    // For every coset c, for all x in c.set, f(x) should equal f(c.rep)
    for (const coset of Q.elems) {
      for (const x of coset.set) {
        expect(f.map(x)).toBe(f.map(coset.rep));
      }
    }
  });
});

describe("Second and Third Isomorphism Theorems (finite examples)", () => {
  test("Second Isomorphism Theorem: Z6 with A={0,2,4}, N={0,3}", () => {
    const Z6 = ZmodAdd(6);
    const A_elements = [0, 2, 4]; // subgroup of order 3
    const N_elements = [0, 3];    // normal subgroup of order 2
    
    const secondIso = secondIsomorphismTheorem(Z6, A_elements, N_elements, "Z6 Second Iso");
    
    // Verify witness data
    expect(secondIso.witnesses?.secondIsoData).toBeDefined();
    const data = secondIso.witnesses!.secondIsoData!;
    
    // A·N should be all of Z6 (since gcd(2,3)=1)
    expect(data.product.elems.sort()).toEqual([0, 1, 2, 3, 4, 5]);
    
    // A∩N should be {0} (trivial intersection)
    expect(data.intersection.elems.sort()).toEqual([0]);
    
    // Verify subgroup properties
    expect(data.subgroup.elems.sort()).toEqual([0, 2, 4]);
    expect(data.normalSubgroup.elems.sort()).toEqual([0, 3]);
  });

  test("Third Isomorphism Theorem: Z12 with K={0,6}, N={0,3,6,9}", () => {
    const Z12 = ZmodAdd(12);
    const K_elements = [0, 6];        // normal subgroup of order 2
    const N_elements = [0, 3, 6, 9];  // normal subgroup of order 4, K ⊆ N
    
    const thirdIso = thirdIsomorphismTheorem(Z12, K_elements, N_elements, "Z12 Third Iso");
    
    // Verify witness data
    expect(thirdIso.witnesses?.thirdIsoData).toBeDefined();
    const data = thirdIso.witnesses!.thirdIsoData!;
    
    // Verify subgroup properties
    expect(data.innerNormal.elems.sort()).toEqual([0, 6]);
    expect(data.outerNormal.elems.sort()).toEqual([0, 3, 6, 9]);
    
    // Verify K ⊆ N
    expect(data.innerNormal.elems.every(k => 
      data.outerNormal.elems.some(n => Z12.eq(k, n))
    )).toBe(true);
  });

  test("Third Isomorphism Theorem error: K not subset of N", () => {
    const Z8 = ZmodAdd(8);
    const K_elements = [0, 2];  // {0,2,4,6} would be normal
    const N_elements = [0, 4];  // {0,4} is normal, but K not subset of N
    
    expect(() => thirdIsomorphismTheorem(Z8, K_elements, N_elements))
      .toThrow("Third Isomorphism Theorem requires K ⊆ N");
  });
});