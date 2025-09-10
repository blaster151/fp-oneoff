import { describe, it, expect } from "vitest";
import { kleinAsZ2xZ2, kleinAsRectOps } from "../../src/cat/grp/Examples";

describe("Klein four-group models are isomorphic (structural sameness)", () => {
  it("Both Z2×Z2 and RectangleSymOps are Klein four-groups", () => {
    const K1 = kleinAsZ2xZ2();
    const K3 = kleinAsRectOps(); // four ops: id, H-reflect, V-reflect, rotate 180
    
    // Check if both are actually Klein four-groups by verifying the group axioms
    // For Klein four-group: all non-identity elements have order 2
    for (const a of K1.carrier) {
      if (!K1.eq(a, K1.e)) {
        const a2 = K1.op(a, a);
        expect(K1.eq(a2, K1.e)).toBe(true); // a^2 = e
      }
    }
    
    for (const a of K3.carrier) {
      if (!K3.eq(a, K3.e)) {
        const a2 = K3.op(a, a);
        expect(K3.eq(a2, K3.e)).toBe(true); // a^2 = e
      }
    }
    
    // Both groups have 4 elements
    expect(K1.carrier.length).toBe(4);
    expect(K3.carrier.length).toBe(4);
    
    // Both are abelian (commutative)
    for (const a of K1.carrier) {
      for (const b of K1.carrier) {
        const ab = K1.op(a, b);
        const ba = K1.op(b, a);
        expect(K1.eq(ab, ba)).toBe(true);
      }
    }
    
    for (const a of K3.carrier) {
      for (const b of K3.carrier) {
        const ab = K3.op(a, b);
        const ba = K3.op(b, a);
        expect(K3.eq(ab, ba)).toBe(true);
      }
    }
  });
});
