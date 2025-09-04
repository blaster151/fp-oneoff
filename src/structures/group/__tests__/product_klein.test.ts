import { describe, it, expect } from "vitest";
import { Z2 } from "../util/FiniteGroups";
import { tupleScheme } from "../pairing/PairingScheme";
import { productGroup } from "../builders/Product";

describe("Product Z2 × Z2 gives Klein 4-group", () => {
  const G = Z2, H = Z2;
  const S = tupleScheme<number, number>();
  const K = productGroup(G, H, S);

  it("has 4 elements", () => {
    expect(K.elems.length).toBe(4);
    // Should have: (0,0), (0,1), (1,0), (1,1)
    const expectedPairs = [{ a: 0, b: 0 }, { a: 0, b: 1 }, { a: 1, b: 0 }, { a: 1, b: 1 }];
    for (const expected of expectedPairs) {
      const found = K.elems.find(o => S.left(o) === expected.a && S.right(o) === expected.b);
      expect(found).toBeDefined();
    }
  });

  it("is abelian", () => {
    for (const a of K.elems) {
      for (const b of K.elems) {
        const ab = K.op(a, b);
        const ba = K.op(b, a);
        expect(K.eq(ab, ba)).toBe(true);
      }
    }
  });

  it("each element is its own inverse", () => {
    for (const a of K.elems) {
      const aa = K.op(a, a);
      expect(K.eq(aa, K.id)).toBe(true);
    }
  });

  it("Klein 4-group structure: identity + 3 elements of order 2", () => {
    // Find identity element
    const identity = K.elems.find(o => S.left(o) === 0 && S.right(o) === 0);
    expect(identity).toBeDefined();
    expect(K.eq(identity!, K.id)).toBe(true);

    // All other elements should have order 2
    const nonIdentity = K.elems.filter(o => !K.eq(o, K.id));
    expect(nonIdentity.length).toBe(3);
    
    for (const a of nonIdentity) {
      const aa = K.op(a, a);
      expect(K.eq(aa, K.id)).toBe(true);
    }
  });

  it("componentwise operations work correctly", () => {
    // Test specific operation: (1,0) + (0,1) = (1,1)
    const a = K.elems.find(o => S.left(o) === 1 && S.right(o) === 0)!;
    const b = K.elems.find(o => S.left(o) === 0 && S.right(o) === 1)!;
    const result = K.op(a, b);
    
    expect(S.left(result)).toBe(1); // 1 + 0 = 1 mod 2
    expect(S.right(result)).toBe(1); // 0 + 1 = 1 mod 2
  });
});