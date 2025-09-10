import { describe, it, expect } from "vitest";
import { FinGroup, FinGroupMor, makeFinGroup } from "../../src/cat/grp/FinGrp";
import { pullback } from "../../src/cat/grp/limits";

// Define the test groups
const Z8: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3,4,5,6,7],
  e: 0,
  op: (a,b) => (a + b) % 8,
  inv: a => (8 - (a % 8)) % 8,
  eq: (a,b) => a === b
});

const Z4: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3],
  e: 0,
  op: (a,b) => (a + b) % 4,
  inv: a => (4 - (a % 4)) % 4,
  eq: (a,b) => a === b
});

const Z2: FinGroup<number> = makeFinGroup({
  carrier: [0,1],
  e: 0,
  op: (a,b) => (a + b) % 2,
  inv: a => a % 2,
  eq: (a,b) => a === b
});

// Helper function to create homomorphisms
function hom<A, B>(src: FinGroup<A>, dst: FinGroup<B>, fn: (a: A) => B): FinGroupMor<A, B> {
  return { src, dst, run: fn };
}

describe("Grp: small limits/colimits", () => {
  it("pullback of Z8→Z4 ←Z2 is the fibered product", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    const g = hom(Z2, Z4, (n) => n * 2); // 0↦0, 1↦2

    const PB = pullback(Z8, Z2, Z4, f, g);

    // Check that every pair [a,b] satisfies f(a) = g(b)
    for (const [a, b] of PB) {
      const left = f.run(a);
      const right = g.run(b);
      expect(left).toEqual(right);
    }

    // Check cardinality: should be exactly the pairs where f(a) = g(b)
    // f: Z8→Z4 maps to {0,1,2,3}, g: Z2→Z4 maps to {0,2}
    // So f(a) = g(b) when f(a) ∈ {0,2}
    // f(a) = 0 when a ∈ {0,4}, f(a) = 2 when a ∈ {2,6}
    // So we expect 4 pairs: (0,0), (4,0), (2,1), (6,1)
    expect(PB.length).toBe(4);
  });
});
