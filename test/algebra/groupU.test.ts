import { describe, it, expect } from "vitest";
import { finiteOpsU0 } from "../../src/size/Universe";
import { Zmod, isHom } from "../../src/algebra/GroupU";

describe("Universe-Parametric Groups", () => {
  it("creates cyclic groups", () => {
    const ops = finiteOpsU0;
    const Z4 = Zmod(ops, 4);
    
    expect(Z4.e).toBe(0);
    expect(Z4.op(1, 2)).toBe(3); // 1 + 2 = 3 (mod 4)
    expect(Z4.op(2, 3)).toBe(1); // 2 + 3 = 5 ≡ 1 (mod 4)
    expect(Z4.inv(1)).toBe(3);   // -1 ≡ 3 (mod 4)
    expect(Z4.inv(2)).toBe(2);   // -2 ≡ 2 (mod 4)
    
    // Check carrier
    const carrier = ops.fromSmall(Z4.carrier.carrier);
    expect(carrier).toEqual([0, 1, 2, 3]);
  });

  it("verifies group laws for cyclic groups", () => {
    const ops = finiteOpsU0;
    const Z4 = Zmod(ops, 4);
    
    // Associativity: (a + b) + c = a + (b + c)
    expect(Z4.op(Z4.op(1, 2), 3)).toBe(Z4.op(1, Z4.op(2, 3)));
    
    // Identity: a + 0 = a = 0 + a
    expect(Z4.op(2, Z4.e)).toBe(2);
    expect(Z4.op(Z4.e, 2)).toBe(2);
    
    // Inverse: a + (-a) = 0
    expect(Z4.op(1, Z4.inv(1))).toBe(0);
    expect(Z4.op(2, Z4.inv(2))).toBe(0);
  });

  it("creates group homomorphisms", () => {
    const ops = finiteOpsU0;
    const Z4 = Zmod(ops, 4);
    const Z2 = Zmod(ops, 2);
    
    // f: Z4 -> Z2, x |-> x mod 2
    const f = {
      Uops: ops,
      dom: Z4,
      cod: Z2,
      map: (x: number) => x % 2,
      preservesOp: (x: number, y: number) => true
    };
    
    // Check homomorphism property
    expect(f.map(0)).toBe(0);
    expect(f.map(1)).toBe(1);
    expect(f.map(2)).toBe(0);
    expect(f.map(3)).toBe(1);
    
    // Verify it's a homomorphism
    expect(isHom(f, 1, 2)).toBe(true); // f(1+2) = f(3) = 1, f(1)+f(2) = 1+0 = 1
    expect(isHom(f, 2, 3)).toBe(true); // f(2+3) = f(1) = 1, f(2)+f(3) = 0+1 = 1
  });

  it("demonstrates universe polymorphism in groups", () => {
    const ops = finiteOpsU0;
    
    // Create groups in U0
    const Z3 = Zmod(ops, 3);
    const Z6 = Zmod(ops, 6);
    
    // These groups are "U0-small"
    const carrier3 = ops.fromSmall(Z3.carrier.carrier);
    const carrier6 = ops.fromSmall(Z6.carrier.carrier);
    
    expect(carrier3).toEqual([0, 1, 2]);
    expect(carrier6).toEqual([0, 1, 2, 3, 4, 5]);
    
    // In a larger universe U1, these would become "objects" rather than "small objects"
    console.log("Groups in U0 become objects in U1");
  });
});
