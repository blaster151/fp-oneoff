import { describe, it, expect } from "vitest";
import { ZnRing, M2ZnRing } from "../Ring";
import { zero, productRing, projections, productLift, forgetfulToAb, productRingAdditiveGroup } from "../RingCategory";
import { tupleScheme } from "../../group/pairing/PairingScheme";

describe("Category Ring: products, zero morphisms, functor to Ab", () => {
  it("zero morphism maps everything to zero", () => {
    const Z4 = ZnRing(4);
    const Z2 = ZnRing(2);
    const z = zero(Z4, Z2);
    
    for (const x of Z4.elems) {
      expect(z.f(x)).toBe(Z2.zero);
    }
  });

  it("product ring ℤ/2 × ℤ/3", () => {
    const Z2 = ZnRing(2);
    const Z3 = ZnRing(3);
    const Z2xZ3 = productRing(Z2, Z3);
    
    expect(Z2xZ3.elems.length).toBe(6); // 2 × 3 = 6
    expect(Z2xZ3.comm).toBe(true); // both factors commutative
    
    // Check operations
    const a = {a: 0, b: 1}; // (0,1) in ℤ/2 × ℤ/3
    const b = {a: 1, b: 2}; // (1,2) in ℤ/2 × ℤ/3
    const sum = Z2xZ3.add(a, b);
    expect(sum).toEqual({a: 1, b: 0}); // (1,0) in ℤ/2 × ℤ/3
    
    const prod = Z2xZ3.mul(a, b);
    expect(prod).toEqual({a: 0, b: 2}); // (0,2) in ℤ/2 × ℤ/3
  });

  it("projections from product ring", () => {
    const Z2 = ZnRing(2);
    const Z3 = ZnRing(3);
    const { p1, p2 } = projections(Z2, Z3);
    
    const x = {a: 1, b: 2}; // (1,2) in ℤ/2 × ℤ/3
    expect(p1.f(x)).toBe(1); // first projection
    expect(p2.f(x)).toBe(2); // second projection
  });

  it("universal property of product ring", () => {
    const Z6 = ZnRing(6);
    const Z2 = ZnRing(2);
    const Z3 = ZnRing(3);
    
    // Define f: ℤ/6 → ℤ/2 and g: ℤ/6 → ℤ/3
    const f = { source: Z6, target: Z2, f: (x: number) => x % 2 };
    const g = { source: Z6, target: Z3, f: (x: number) => x % 3 };
    
    const { RS, pair } = productLift(Z6, Z2, Z3, f, g);
    const { p1, p2 } = projections(Z2, Z3);
    
    // Check universal property: p1∘pair = f, p2∘pair = g
    for (const x of Z6.elems) {
      expect(p1.f(pair.f(x))).toBe(f.f(x));
      expect(p2.f(pair.f(x))).toBe(g.f(x));
    }
  });

  it("forgetful functor Ring → Ab", () => {
    const Z4 = ZnRing(4);
    const AbZ4 = forgetfulToAb(Z4);
    
    // Check that additive structure is preserved
    expect(AbZ4.elems).toEqual(Z4.elems);
    expect(AbZ4.op(2, 3)).toBe(Z4.add(2, 3));
    expect(AbZ4.id).toBe(Z4.zero);
    expect(AbZ4.inv(2)).toBe(Z4.neg(2));
  });

  it("product ring's additive group equals direct sum", () => {
    const Z2 = ZnRing(2);
    const Z3 = ZnRing(3);
    
    expect(productRingAdditiveGroup(Z2, Z3)).toBe(true);
  });

  it("product ring with noncommutative factors", () => {
    const Z2 = ZnRing(2);
    const M2Z2 = M2ZnRing(2);
    const Z2xM2 = productRing(Z2, M2Z2);
    
    expect(Z2xM2.comm).toBe(false); // M₂(ℤ/2) is noncommutative
    expect(Z2xM2.elems.length).toBe(2 * 16); // 2 × 16 = 32
  });

  it("associativity of product ring", () => {
    const Z2 = ZnRing(2);
    const Z3 = ZnRing(3);
    const Z5 = ZnRing(5);
    
    const Z2xZ3 = productRing(Z2, Z3);
    const Z2xZ3xZ5 = productRing(Z2xZ3, Z5);
    
    const Z3xZ5 = productRing(Z3, Z5);
    const Z2xZ3xZ5_alt = productRing(Z2, Z3xZ5);
    
    // Both should have same number of elements
    expect(Z2xZ3xZ5.elems.length).toBe(30); // 2 × 3 × 5 = 30
    expect(Z2xZ3xZ5_alt.elems.length).toBe(30);
  });
});