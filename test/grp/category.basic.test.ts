import { describe, it, expect } from "vitest";
import { Grp } from "../../src/cat/grp/GrpCategory";
import { FinGroup, FinGroupMor, makeFinGroup } from "../../src/cat/grp/FinGrp";

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

describe("Grp: category laws", () => {
  it("identities behave as identities", () => {
    const idZ8 = Grp.id(Z8);
    const h = hom(Z8, Z4, (n) => n % 4);

    const left = Grp.compose(h, idZ8);         // h ∘ id = h
    const right = Grp.compose(Grp.id(Z4), h);  // id ∘ h = h

    for (const x of Z8.carrier) {
      expect(left.run(x)).toEqual(h.run(x));
      expect(right.run(x)).toEqual(h.run(x));
    }
  });

  it("associativity of composition", () => {
    const f = hom(Z8, Z4, (n) => n % 4);
    const g = hom(Z4, Z2, (n) => n % 2);
    const k = hom(Z2, Z2, (n) => (n + 1) % 2); // flip

    const gof = Grp.compose(f, g);          // g ∘ f : Z8→Z2
    const k_gof = Grp.compose(gof, k);      // k ∘ (g ∘ f)

    const kog = Grp.compose(g, k);          // k ∘ g : Z4→Z2
    const kog_f = Grp.compose(f, kog);      // (k ∘ g) ∘ f

    for (const x of Z8.carrier) {
      expect(k_gof.run(x)).toEqual(kog_f.run(x));
    }
  });
});
