import { ZmodAdd } from "../examples";
import { makeSubgroup } from "../SubgroupOps";
import { thirdIsomorphism } from "../ThirdIso";

describe("Third Isomorphism Theorem on Z12 (abelian, so all normal)", () => {
  test("N = ⟨4⟩, K = ⟨2⟩ in Z12 (N ≤ K)", () => {
    const Z12 = ZmodAdd(12);
    const N = makeSubgroup(Z12, [0,4,8], "⟨4⟩");  // N = {0,4,8}
    const K = makeSubgroup(Z12, [0,2,4,6,8,10], "⟨2⟩"); // K = {0,2,4,6,8,10}
    
    // Verify N ≤ K
    expect(N.elems.every(n => K.elems.includes(n))).toBe(true);
    
    const res = thirdIsomorphism(Z12, N, K);
    
    // Check that the isomorphism works
    expect(res.iso.leftInverse).toBe(true);
    expect(res.iso.rightInverse).toBe(true);
    
    // Sizes should match: |(G/N)/(K/N)| = |G/K|
    expect(res.quotient_GmodN_mod_KmodN.elems.length).toBe(res.GmodK.elems.length);
  });
  
  test("N = ⟨6⟩, K = ⟨3⟩ in Z12 (N ≤ K)", () => {
    const Z12 = ZmodAdd(12);
    const N = makeSubgroup(Z12, [0,6], "⟨6⟩");     // N = {0,6}
    const K = makeSubgroup(Z12, [0,3,6,9], "⟨3⟩"); // K = {0,3,6,9}
    
    // Verify N ≤ K
    expect(N.elems.every(n => K.elems.includes(n))).toBe(true);
    
    const res = thirdIsomorphism(Z12, N, K);
    
    // Check that the isomorphism works
    expect(res.iso.leftInverse).toBe(true);
    expect(res.iso.rightInverse).toBe(true);
    
    // Sizes should match: |(G/N)/(K/N)| = |G/K|
    expect(res.quotient_GmodN_mod_KmodN.elems.length).toBe(res.GmodK.elems.length);
  });
});