import { Cyclic } from "../Group";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../Hom";

describe("Classical Isomorphism Theorems", () => {
  
  describe("Second Isomorphism Theorem", () => {
    test("Z/8Z example: A={0,4}, N={0,2,4,6}", () => {
      const Z8 = Cyclic(8);
      const A = [0, 4];  // Subgroup of order 2
      const N = [0, 2, 4, 6];  // Normal subgroup of order 4
      
      const secondIso = secondIsomorphismTheorem(Z8, A, N, "Z8 example");
      
      // A·N should be all of N (since A ⊆ N in this case)
      expect(secondIso.witnesses?.secondIsoData?.product.elems.sort())
        .toEqual([0, 2, 4, 6]);
      
      // A∩N should be A (since A ⊆ N)  
      expect(secondIso.witnesses?.secondIsoData?.intersection.elems.sort())
        .toEqual([0, 4]);
    });
  });
  
  describe("Third Isomorphism Theorem", () => {
    test("Z/12Z example: K={0,6}, N={0,3,6,9}", () => {
      const Z12 = Cyclic(12);
      const K = [0, 6];     // Subgroup of order 2
      const N = [0, 3, 6, 9]; // Subgroup of order 4, K ⊆ N
      
      const thirdIso = thirdIsomorphismTheorem(Z12, K, N, "Z12 example");
      
      expect(thirdIso.witnesses?.thirdIsoData?.innerNormal.elems.sort())
        .toEqual([0, 6]);
      expect(thirdIso.witnesses?.thirdIsoData?.outerNormal.elems.sort())
        .toEqual([0, 3, 6, 9]);
    });
    
    test("should throw error if K is not subset of N", () => {
      const Z8 = Cyclic(8);
      const K = [0, 2];    // Not subset of N
      const N = [0, 4];    
      
      expect(() => thirdIsomorphismTheorem(Z8, K, N))
        .toThrow("Third Isomorphism Theorem requires K ⊆ N");
    });
  });
});