import { describe, it, expect } from "vitest";
import { ZnRing, M2ZnRing, M2 } from "../Ring";
import { isRingHom, compose, id, RingHom } from "../RingHom";

describe("Ring homomorphisms", () => {
  it("ℤ/6 → ℤ/3 reduction mod 3 is ring hom", () => {
    const Z6 = ZnRing(6);
    const Z3 = ZnRing(3);
    
    const f: RingHom<number,number> = {
      source: Z6,
      target: Z3,
      f: (x: number) => x % 3
    };
    
    expect(isRingHom(f)).toBe(true);
    
    // Check specific values
    expect(f.f(0)).toBe(0); // 0 ↦ 0
    expect(f.f(1)).toBe(1); // 1 ↦ 1
    expect(f.f(5)).toBe(2); // 5 ↦ 2
  });

  it("ℤ/4 → ℤ/2 reduction mod 2 preserves operations", () => {
    const Z4 = ZnRing(4);
    const Z2 = ZnRing(2);
    
    const f: RingHom<number,number> = {
      source: Z4,
      target: Z2,
      f: (x: number) => x % 2
    };
    
    expect(isRingHom(f)).toBe(true);
    
    // Test preservation: f(a+b) = f(a)+f(b), f(a*b) = f(a)*f(b)
    expect(f.f(Z4.add(3, 2))).toBe(Z2.add(f.f(3), f.f(2))); // f(1) = f(3)+f(2) = 1+0 = 1
    expect(f.f(Z4.mul(3, 2))).toBe(Z2.mul(f.f(3), f.f(2))); // f(2) = f(3)*f(2) = 1*0 = 0
  });

  it("identity is ring hom", () => {
    const Z5 = ZnRing(5);
    const idZ5 = id(Z5);
    expect(isRingHom(idZ5)).toBe(true);
  });

  it("composition of ring homs is ring hom", () => {
    const Z12 = ZnRing(12);
    const Z4 = ZnRing(4);
    const Z2 = ZnRing(2);
    
    const f: RingHom<number,number> = {
      source: Z12,
      target: Z4,
      f: (x: number) => x % 4
    };
    
    const g: RingHom<number,number> = {
      source: Z4,
      target: Z2,
      f: (x: number) => x % 2
    };
    
    expect(isRingHom(f)).toBe(true);
    expect(isRingHom(g)).toBe(true);
    
    const gf = compose(f, g);
    expect(isRingHom(gf)).toBe(true);
    
    // Check composition: (g∘f)(x) = g(f(x))
    expect(gf.f(7)).toBe(g.f(f.f(7))); // 7 ↦ 3 ↦ 1
  });

  it("non-homomorphism fails preservation check", () => {
    const Z4 = ZnRing(4);
    const Z2 = ZnRing(2);
    
    // This function doesn't preserve multiplication
    const bad: RingHom<number,number> = {
      source: Z4,
      target: Z2,
      f: (x: number) => (x === 0) ? 0 : 1 // constant except at 0
    };
    
    expect(isRingHom(bad)).toBe(false);
  });

  it("M₂(ℤ/2) → ℤ/2 trace is not ring hom (no multiplicative identity)", () => {
    const M2Z2 = M2ZnRing(2);
    const Z2 = ZnRing(2);
    
    const trace: RingHom<M2,number> = {
      source: M2Z2,
      target: Z2,
      f: (m: M2) => (m.a + m.d) % 2
    };
    
    // Trace doesn't preserve multiplicative identity
    const I = {a:1,b:0,c:0,d:1};
    expect(trace.f(I)).toBe(0); // trace(I) = 1+1 = 0 in ℤ/2
    expect(Z2.one).toBe(1);
    expect(isRingHom(trace)).toBe(false);
  });
});