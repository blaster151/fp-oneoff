import { describe, it, expect } from "vitest";
import { Zn } from "../util/FiniteGroups";
import { conjugation, isInnerAutomorphism } from "../automorphisms/Conjugation";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../../../algebra/group/Hom";
import { analyzeCenterWithIsomorphismTheorems } from "../center/Center";
import { analyzeInnerAutomorphismsWithIsomorphismTheorems } from "../automorphisms/Inner";
import { analyzeAutomorphismGroupWithIsomorphismTheorems } from "../automorphisms/Aut";

/** On abelian groups, conjugation is the identity automorphism. */
describe("Conjugation is an automorphism (abelian sanity)", () => {
  const G = Zn(5);
  it("conj_g = id for all g in abelian G", () => {
    for (const g of G.elems) {
      const cg = conjugation(G, g);
      for (const x of G.elems) {
        expect(G.eq(cg.f(x), x)).toBe(true);
      }
      expect(isInnerAutomorphism(G, g)).toBe(true);
    }
  });
});

describe("Conjugation and Isomorphism Theorems", () => {
  it("Center analysis with validation on Z6", () => {
    const Z6 = Zn(6);
    const analysis = analyzeCenterWithIsomorphismTheorems(Z6);
    
    // Basic validation
    expect(analysis.isValidGroup).toBe(true);
    expect(analysis.groupSize).toBe(6);
    expect(analysis.centerSize).toBe(6); // Z6 is abelian, so center is all of Z6
    expect(analysis.centerIndex).toBe(1);
    expect(analysis.hasNonTrivialCenter).toBe(true);
    
    // Check if we can apply isomorphism theorems
    expect(analysis.canApplySecondIso).toBe(true);
    expect(analysis.canApplyThirdIso).toBe(true);
  });

  it("Inner automorphism analysis with validation on Z8", () => {
    const Z8 = Zn(8);
    const analysis = analyzeInnerAutomorphismsWithIsomorphismTheorems(Z8);
    
    // Basic validation
    expect(analysis.isValidGroup).toBe(true);
    expect(analysis.groupSize).toBe(8);
    expect(analysis.centerSize).toBe(8); // Z8 is abelian, so center is all of Z8
    expect(analysis.innerAutoSize).toBe(1); // Only identity automorphism
    expect(analysis.hasNonTrivialInnerAutos).toBe(false); // Abelian groups have trivial inner autos
    
    // Check if we can apply isomorphism theorems
    expect(analysis.canApplySecondIso).toBe(true);
    expect(analysis.canApplyThirdIso).toBe(true);
  });

  it("Automorphism group analysis with validation on Z4", () => {
    const Z4 = Zn(4);
    const analysis = analyzeAutomorphismGroupWithIsomorphismTheorems(Z4);
    
    // Basic validation
    expect(analysis.isValidGroup).toBe(true);
    expect(analysis.groupSize).toBe(4);
    expect(analysis.centerSize).toBe(4); // Z4 is abelian, so center is all of Z4
    expect(analysis.autSize).toBe(2); // Aut(Z4) has 2 elements (identity and x -> 3x)
    expect(analysis.hasNonTrivialAutos).toBe(true);
    
    // Check if we can apply isomorphism theorems
    expect(analysis.canApplySecondIso).toBe(true);
    expect(analysis.canApplyThirdIso).toBe(true);
  });

  it("Second Isomorphism Theorem: cyclic subgroup with center on Z8", () => {
    const Z8 = Zn(8);
    const cyclicSubgroup = [0, 4]; // {0, 4} is a subgroup
    const centerElements = [0, 1, 2, 3, 4, 5, 6, 7]; // All of Z8 (abelian)
    
    const secondIso = secondIsomorphismTheorem(Z8, cyclicSubgroup, centerElements, "Z8 Cyclic-Center");
    
    // Verify witness data
    expect(secondIso.witnesses?.secondIsoData).toBeDefined();
    const data = secondIso.witnesses!.secondIsoData!;
    
    // A·N should be all of Z8 (since A ⊆ N in this case)
    expect(data.product.elems.sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    
    // A∩N should be A itself (since A ⊆ N)
    expect(data.intersection.elems.sort()).toEqual([0, 4]);
  });

  it("Third Isomorphism Theorem: nested normal subgroups on Z12", () => {
    const Z12 = Zn(12);
    const K_elements = [0, 6];        // {0, 6} is normal
    const N_elements = [0, 3, 6, 9];  // {0, 3, 6, 9} is normal, K ⊆ N
    
    const thirdIso = thirdIsomorphismTheorem(Z12, K_elements, N_elements, "Z12 Nested Normal");
    
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

  it("Error handling: Third Isomorphism Theorem with invalid K ⊆ N", () => {
    const Z8 = Zn(8);
    const K_elements = [0, 2];  // {0, 2, 4, 6} would be normal
    const N_elements = [0, 4];  // {0, 4} is normal, but K not subset of N
    
    expect(() => thirdIsomorphismTheorem(Z8, K_elements, N_elements))
      .toThrow("Third Isomorphism Theorem requires K ⊆ N");
  });
});