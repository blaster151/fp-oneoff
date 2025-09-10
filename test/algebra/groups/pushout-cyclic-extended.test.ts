import { describe, it, expect } from "vitest";
import { homZkToZm } from "../../../src/algebra/groups/cyclic";
import { pushoutWithCocone, listAllRepresentatives, verifyCoconeProperty, verifyPushoutSize } from "../../../src/algebra/groups/pushout-cyclic-extended";

describe("Extended Pushout Functionality", () => {
  it("creates canonical cocone maps", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const { pushout, i_A, i_B } = pushoutWithCocone(f, g);
    
    // Test i_A: Z_4 -> PO, a |-> [a, 0]
    const i_A_0 = i_A(0);
    const i_A_1 = i_A(1);
    const i_A_2 = i_A(2);
    const i_A_3 = i_A(3);
    
    expect(pushout.eq(i_A_0, [0, 0])).toBe(true);
    expect(pushout.eq(i_A_1, [1, 0])).toBe(true);
    expect(pushout.eq(i_A_2, [2, 0])).toBe(true);
    expect(pushout.eq(i_A_3, [3, 0])).toBe(true);
    
    // Test i_B: Z_6 -> PO, b |-> [0, b]
    const i_B_0 = i_B(0);
    const i_B_1 = i_B(1);
    const i_B_2 = i_B(2);
    
    expect(pushout.eq(i_B_0, [0, 0])).toBe(true);
    expect(pushout.eq(i_B_1, [0, 1])).toBe(true);
    expect(pushout.eq(i_B_2, [0, 2])).toBe(true);
  });
  
  it("verifies cocone property: i_A ∘ f = i_B ∘ g", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    
    expect(verifyCoconeProperty(f, g)).toBe(true);
    
    // Test with different homomorphisms
    const f2 = homZkToZm(3, 6, 0);
    const g2 = homZkToZm(3, 9, 0);
    
    expect(verifyCoconeProperty(f2, g2)).toBe(true);
  });
  
  it("lists all normalized representatives", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const { pushout } = pushoutWithCocone(f, g);
    
    const representatives = listAllRepresentatives(pushout);
    
    // Should have exactly pushout.size representatives
    expect(representatives.length).toBe(pushout.size);
    expect(representatives.length).toBe(12);
    
    // All representatives should be normalized
    for (const rep of representatives) {
      const normalized = pushout.norm(rep);
      expect(pushout.eq(rep, normalized)).toBe(true);
    }
    
    // All representatives should be distinct
    for (let i = 0; i < representatives.length; i++) {
      for (let j = i + 1; j < representatives.length; j++) {
        expect(pushout.eq(representatives[i], representatives[j])).toBe(false);
      }
    }
  });
  
  it("verifies pushout size matches number of representatives", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const { pushout } = pushoutWithCocone(f, g);
    
    expect(verifyPushoutSize(pushout)).toBe(true);
    
    // Test with different case
    const f2 = homZkToZm(3, 4, 0);
    const g2 = homZkToZm(3, 5, 0);
    const { pushout: pushout2 } = pushoutWithCocone(f2, g2);
    
    expect(verifyPushoutSize(pushout2)).toBe(true);
  });
  
  it("demonstrates pushout universal property with concrete example", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const { pushout, i_A, i_B } = pushoutWithCocone(f, g);
    
    // The universal property: for any group H and homomorphisms h1: Z_4 -> H, h2: Z_6 -> H
    // such that h1 ∘ f = h2 ∘ g, there exists a unique h: P -> H
    // such that h ∘ i1 = h1 and h ∘ i2 = h2
    
    // In our case, we can verify that i_A ∘ f = i_B ∘ g
    // Both should map Z_2 to the same element in the pushout
    
    const z2_elements = f.src.elements; // [0, 1]
    
    for (const k of z2_elements) {
      const f_k = f.map(k);
      const g_k = g.map(k);
      
      const i_A_f_k = i_A(f_k);
      const i_B_g_k = i_B(g_k);
      
      // These should be equal in the pushout
      expect(pushout.eq(i_A_f_k, i_B_g_k)).toBe(true);
      
      console.log(`k=${k}: f(k)=${f_k}, g(k)=${g_k}`);
      console.log(`  i_A(f(k)) = [${i_A_f_k[0]}, ${i_A_f_k[1]}]`);
      console.log(`  i_B(g(k)) = [${i_B_g_k[0]}, ${i_B_g_k[1]}]`);
      console.log(`  Equal: ${pushout.eq(i_A_f_k, i_B_g_k)}`);
    }
  });
});
