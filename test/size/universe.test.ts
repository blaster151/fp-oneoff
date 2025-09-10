import { describe, it, expect } from "vitest";
import { U0, U1, U0_in_U1, finiteOpsU0, UniverseOps, Brand } from "../../src/size/Universe";

describe("Grothendieck Universe System", () => {
  it("creates universe tokens", () => {
    expect(U0.U.__brand).toBe("U0");
    expect(U1.U.__brand).toBe("U1");
  });

  it("creates universe inclusions", () => {
    expect(U0_in_U1.small).toBe(U0);
    expect(U0_in_U1.big).toBe(U1);
  });

  it("creates and manipulates small objects", () => {
    const ops = finiteOpsU0;
    
    // Create small objects
    const smallNumber = ops.toSmall(42);
    const smallString = ops.toSmall("hello");
    
    // Extract values
    expect(ops.fromSmall(smallNumber)).toBe(42);
    expect(ops.fromSmall(smallString)).toBe("hello");
  });

  it("creates pairs and sums", () => {
    const ops = finiteOpsU0;
    
    const a = ops.toSmall(1);
    const b = ops.toSmall(2);
    
    // Create pair
    const pair = ops.pair(a, b);
    const [x, y] = ops.fromSmall(pair);
    expect(x).toBe(1);
    expect(y).toBe(2);
    
    // Create left injection
    const inl = ops.inl(a);
    const left = ops.fromSmall(inl);
    expect(left.tag).toBe("inl");
    expect(left.value).toBe(1);
    
    // Create right injection
    const inr = ops.inr(b);
    const right = ops.fromSmall(inr);
    expect(right.tag).toBe("inr");
    expect(right.value).toBe(2);
  });

  it("creates lists", () => {
    const ops = finiteOpsU0;
    
    const a = ops.toSmall(1);
    const b = ops.toSmall(2);
    const c = ops.toSmall(3);
    
    const list = ops.list(a, b, c);
    const arr = ops.fromSmall(list);
    expect(arr).toEqual([1, 2, 3]);
  });

  it("creates functions", () => {
    const ops = finiteOpsU0;
    
    const domain = ops.toSmall([1, 2, 3]);
    const f = (x: number) => x * 2;
    
    const func = ops.func(domain, f);
    const extracted = ops.fromSmall(func);
    
    expect(extracted(1)).toBe(2);
    expect(extracted(2)).toBe(4);
    expect(extracted(3)).toBe(6);
  });

  it("creates equivalence classes", () => {
    const ops = finiteOpsU0;
    
    const rep = ops.toSmall(42);
    const eqvClass = ops.eqvClass(rep);
    const extracted = ops.fromSmall(eqvClass);
    
    expect(extracted.rep).toBe(42);
  });

  it("demonstrates universe polymorphism", () => {
    // This test shows how we can work with different universes
    // In a real implementation, we'd have different UniverseOps instances
    
    const opsU0 = finiteOpsU0;
    
    // Create objects in U0
    const smallU0 = opsU0.toSmall("in U0");
    expect(opsU0.fromSmall(smallU0)).toBe("in U0");
    
    // In a larger universe U1, objects from U0 become "small objects"
    // This is the key insight: U-small objects become objects in U'
    console.log("U0 objects become small objects in U1");
  });
});
