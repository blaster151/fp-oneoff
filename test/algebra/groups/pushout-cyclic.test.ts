import { describe, it, expect } from "vitest";
import { Zmod, homZkToZm } from "../../../src/algebra/groups/cyclic";
import { pushoutCyclic } from "../../../src/algebra/groups/pushout-cyclic";

describe("Cyclic Groups and Pushouts", () => {
  it("creates valid cyclic groups", () => {
    const Z4 = Zmod(4);
    expect(Z4.n).toBe(4);
    expect(Z4.elements).toEqual([0, 1, 2, 3]);
    expect(Z4.add(2, 3)).toBe(1); // 2 + 3 = 5 ≡ 1 (mod 4)
    expect(Z4.neg(2)).toBe(2); // -2 ≡ 2 (mod 4)
    expect(Z4.eq(5, 1)).toBe(true); // 5 ≡ 1 (mod 4)
  });

  it("creates valid homomorphisms between cyclic groups", () => {
    // f: Z_2 -> Z_4, 1 |-> 2 (valid because 2*2 = 4 ≡ 0 mod 4)
    const f = homZkToZm(2, 4, 2);
    expect(f.src.n).toBe(2);
    expect(f.dst.n).toBe(4);
    expect(f.imgOfOne).toBe(2);
    expect(f.map(0)).toBe(0);
    expect(f.map(1)).toBe(2);
  });

  it("rejects invalid homomorphisms", () => {
    // f: Z_2 -> Z_4, 1 |-> 1 (invalid because 2*1 = 2 ≢ 0 mod 4)
    expect(() => homZkToZm(2, 4, 1)).toThrow("Not a hom: need k * u ≡ 0");
  });

  it("computes pushout of Z_2 -> Z_4 and Z_2 -> Z_6", () => {
    // f: Z_2 -> Z_4, 1 |-> 2
    // g: Z_2 -> Z_6, 1 |-> 3
    // Pushout ≅ (Z_4 ⊕ Z_6)/<(2,-3)>
    // ord(2 in Z4) = 4/gcd(4,2) = 2
    // ord(3 in Z6) = 6/gcd(6,3) = 2
    // ord_h = lcm(2,2) = 2
    // size = (4*6)/2 = 12
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const P = pushoutCyclic(f, g);
    
    expect(P.size).toBe(12);
    expect(P.M.n).toBe(4);
    expect(P.N.n).toBe(6);
  });

  it("verifies group axioms for pushout", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const P = pushoutCyclic(f, g);
    
    // Test identity: x + id = x
    const x = P.norm([1, 2]);
    const x_plus_id = P.add(x, P.id);
    expect(P.eq(x, x_plus_id)).toBe(true);
    
    // Test associativity: (x + y) + z = x + (y + z)
    const y = P.norm([2, 1]);
    const z = P.norm([0, 3]);
    const left = P.add(P.add(x, y), z);
    const right = P.add(x, P.add(y, z));
    expect(P.eq(left, right)).toBe(true);
    
    // Test inverse: x + (-x) = id
    const neg_x = P.neg(x);
    const x_plus_neg_x = P.add(x, neg_x);
    expect(P.eq(x_plus_neg_x, P.id)).toBe(true);
  });

  it("handles trivial case: direct sum when u=v=0", () => {
    // f: Z_3 -> Z_4, 1 |-> 0 (trivial map)
    // g: Z_3 -> Z_5, 1 |-> 0 (trivial map)
    // Pushout = Z_4 ⊕ Z_5 (direct sum)
    const f = homZkToZm(3, 4, 0);
    const g = homZkToZm(3, 5, 0);
    const P = pushoutCyclic(f, g);
    
    expect(P.size).toBe(20); // 4 * 5 = 20
    
    // Addition should match direct sum componentwise
    const a = P.norm([1, 2]);
    const b = P.norm([2, 3]);
    const sum = P.add(a, b);
    expect(sum[0]).toBe(3); // 1 + 2 = 3 (mod 4)
    expect(sum[1]).toBe(0); // 2 + 3 = 5 ≡ 0 (mod 5)
  });

  it("normalizes representatives correctly", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const P = pushoutCyclic(f, g);
    
    // Test that normalization is idempotent
    const p = [3, 5];
    const norm_p = P.norm(p);
    const norm_norm_p = P.norm(norm_p);
    expect(P.eq(norm_p, norm_norm_p)).toBe(true);
    
    // Test that equivalent pairs normalize to the same representative
    const q = [5, 8]; // Should be equivalent to p after normalization
    const norm_q = P.norm(q);
    expect(P.eq(norm_p, norm_q)).toBe(true);
  });

  it("demonstrates pushout universal property", () => {
    const f = homZkToZm(2, 4, 2);
    const g = homZkToZm(2, 6, 3);
    const P = pushoutCyclic(f, g);
    
    // The pushout should satisfy the universal property:
    // For any group H and homomorphisms h1: Z_4 -> H, h2: Z_6 -> H
    // such that h1 ∘ f = h2 ∘ g, there exists a unique h: P -> H
    // such that h ∘ i1 = h1 and h ∘ i2 = h2
    
    // In our case, the canonical cocone maps are:
    // i1: Z_4 -> P, a |-> [a, 0]
    // i2: Z_6 -> P, b |-> [0, b]
    
    // Test that i1 ∘ f = i2 ∘ g (both should map Z_2 to the same element in P)
    const z2_element = 1; // element of Z_2
    const f_z2 = f.map(z2_element); // f(1) = 2 in Z_4
    const g_z2 = g.map(z2_element); // g(1) = 3 in Z_6
    
    const i1_f_z2 = P.norm([f_z2, 0]); // [2, 0] in P
    const i2_g_z2 = P.norm([0, g_z2]); // [0, 3] in P
    
    // These should be equal in the pushout
    expect(P.eq(i1_f_z2, i2_g_z2)).toBe(true);
  });
});
