import { describe, it, expect } from "vitest";
import { Group, GroupHom } from "../../src/algebra/group/FirstIso";
import { firstIsomorphism } from "../../src/algebra/group/FirstIso";

// A tiny cyclic group C4 under addition mod 4, and a hom to C2 via mod 2.
const C4: Group<number> = {
  eq: (a,b) => a % 4 === b % 4,
  op: (a,b) => (a + b) % 4,
  e: 0,
  inv: a => (4 - (a % 4)) % 4,
  elements: [0,1,2,3],
};

const C2: Group<number> = {
  eq: (a,b) => a % 2 === b % 2,
  op: (a,b) => (a + b) % 2,
  e: 0,
  inv: a => a % 2 === 0 ? 0 : 1, // additive inverse = itself mod 2
  elements: [0,1],
};

const mod2: GroupHom<number, number> = {
  src: C4,
  dst: C2,
  map: (a) => a % 2,
  respectsOp: () => C4.elements!.every(x =>
    C4.elements!.every(y =>
      C2.eq(mod2.map(C4.op(x,y)), C2.op(mod2.map(x), mod2.map(y)))
    ))
};

describe("First Isomorphism Theorem (finite demo)", () => {
  it("C4/ker(mod2) ≅ im(mod2) = C2", () => {
    const { quotient, imageGrp, iso } = firstIsomorphism(mod2);

    // cardinalities match: |C4/ker| = |im|
    expect(quotient.elements!.length).toBe(imageGrp.elements!.length);
    // image is exactly C2 here
    expect(imageGrp.elements!.length).toBe(2);
    
    // Test that the isomorphism preserves structure on specific elements
    const cosets = quotient.elements!;
    expect(cosets.length).toBe(2);
    
    // Test that we can map back and forth for at least one element
    const coset1 = cosets.find(c => c.members.includes(1))!;
    const img1 = iso.to(coset1);
    const back1 = iso.from(img1);
    expect(quotient.eq(back1, coset1)).toBe(true);
  });
});