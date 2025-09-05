import { describe, it, expect } from "vitest";
import { ZnRing, M2ZnRing, checkRingLaws } from "../Ring";

describe("Ring laws for ℤ/n and M₂(ℤ/n)", () => {
  it("ℤ/4 satisfies all ring laws", () => {
    const Z4 = ZnRing(4);
    const check = checkRingLaws(Z4);
    expect(check.ok).toBe(true);
    expect(Z4.comm).toBe(true);
    expect(Z4.elems).toEqual([0,1,2,3]);
    expect(Z4.zero).toBe(0);
    expect(Z4.one).toBe(1);
  });

  it("ℤ/6 multiplication and addition", () => {
    const Z6 = ZnRing(6);
    expect(Z6.mul(2, 3)).toBe(0); // 2*3 = 6 ≡ 0 (mod 6)
    expect(Z6.add(4, 5)).toBe(3); // 4+5 = 9 ≡ 3 (mod 6)
    expect(Z6.neg(2)).toBe(4); // -2 ≡ 4 (mod 6)
  });

  it("M₂(ℤ/2) is noncommutative ring", () => {
    const M2Z2 = M2ZnRing(2);
    const check = checkRingLaws(M2Z2);
    expect(check.ok).toBe(true);
    expect(M2Z2.comm).toBe(false);
    expect(M2Z2.elems.length).toBe(16); // 2^4 = 16 matrices

    // Test noncommutativity: AB ≠ BA
    const A = {a:1,b:0,c:1,d:0};
    const B = {a:0,b:1,c:0,d:1};
    const AB = M2Z2.mul(A, B);
    const BA = M2Z2.mul(B, A);
    expect(M2Z2.eq(AB, BA)).toBe(false);
  });

  it("M₂(ℤ/2) matrix multiplication", () => {
    const M2Z2 = M2ZnRing(2);
    const I = {a:1,b:0,c:0,d:1}; // identity matrix
    const A = {a:1,b:1,c:0,d:1};
    
    expect(M2Z2.eq(M2Z2.mul(I, A), A)).toBe(true);
    expect(M2Z2.eq(M2Z2.mul(A, I), A)).toBe(true);
    
    // Test specific multiplication
    const B = {a:0,b:1,c:1,d:0};
    const AB = M2Z2.mul(A, B);
    expect(AB).toEqual({a:1,b:1,c:1,d:0});
  });

  it("distributivity in M₂(ℤ/3)", () => {
    const M2Z3 = M2ZnRing(3);
    const A = {a:1,b:2,c:0,d:1};
    const B = {a:0,b:1,c:2,d:0};
    const C = {a:1,b:0,c:1,d:2};
    
    // Left distributivity: A(B+C) = AB + AC
    const left = M2Z3.mul(A, M2Z3.add(B, C));
    const right = M2Z3.add(M2Z3.mul(A, B), M2Z3.mul(A, C));
    expect(M2Z3.eq(left, right)).toBe(true);
    
    // Right distributivity: (A+B)C = AC + BC
    const left2 = M2Z3.mul(M2Z3.add(A, B), C);
    const right2 = M2Z3.add(M2Z3.mul(A, C), M2Z3.mul(B, C));
    expect(M2Z3.eq(left2, right2)).toBe(true);
  });
});