import { describe, it, expect } from "vitest";
import { Grp } from "../../src/cat/grp/GrpCategory";
import { FinGroup, FinGroupMor, makeFinGroup } from "../../src/cat/grp/FinGrp";
import { isInjective, isSurjective } from "../../src/cat/grp/recognition";

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

describe("Grp (finite): mono ⇔ injective, epi ⇔ surjective", () => {
  it("Z8→Z4 reduction is epi but not mono", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    expect(isSurjective(Z8, Z4, f)).toBe(true);
    expect(isInjective(Z8, f)).toBe(false);
  });

  it("Z2→Z8 inclusion-of-choices is mono (injective) but not epi", () => {
    // Embed Z2 into Z8 by doubling: 0↦0, 1↦4
    const i = hom(Z2, Z8, (n) => (n * 4) % 8);
    expect(isInjective(Z2, i)).toBe(true);
    expect(isSurjective(Z2, Z8, i)).toBe(false);
  });

  it("categorical mono test (left-cancellation) matches injectivity", () => {
    const i = hom(Z2, Z8, (n) => (n * 4) % 8);
    // brute: for all g,h: A→dom(i), if i∘g = i∘h then g=h
    const A = Z2;
    const allGH = [
      hom(A, Z2, x => 0),
      hom(A, Z2, x => 1),
      hom(A, Z2, x => x),
      hom(A, Z2, x => (x+1)%2),
    ];
    const compose = (g: FinGroupMor<number, number>) => Grp.compose(g, i);
    for (const g of allGH) for (const h of allGH) {
      let eq = true;
      for (const a of A.carrier) {
        if (compose(g).run(a) !== compose(h).run(a)) { eq = false; break; }
      }
      if (eq) {
        // i∘g = i∘h ⇒ g=h
        for (const a of A.carrier) expect(g.run(a)).toEqual(h.run(a));
      }
    }
  });
});
