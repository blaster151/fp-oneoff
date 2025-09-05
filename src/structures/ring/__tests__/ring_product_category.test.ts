import { describe, it, expect } from "vitest";
import { ZnRing } from "../Ring";
import { productRing, projections, pairHom, forgetAdditive } from "../RingCategory";

describe("Product ring universal property and forgetful functor to Ab", () => {
  const R = ZnRing(2);
  const S = ZnRing(3);
  const { RS, pi1, pi2 } = projections(R,S);

  // X = Z6; define homs φ: X→R (mod2) and ψ: X→S (mod3)
  const X = ZnRing(6);
  const phi = (x:number)=> x % 2;
  const psi = (x:number)=> x % 3;

  it("universal property: unique pairing h: X→R×S with π1∘h=φ, π2∘h=ψ", () => {
    const h = pairHom(X,R,S,phi,psi);
    // check projections agree pointwise
    for (const x of X.elems) {
      const hx = h(x);
      expect(R.eq(pi1(hx), phi(x))).toBe(true);
      expect(S.eq(pi2(hx), psi(x))).toBe(true);
    }
    // uniqueness on finite carriers: any other hom with same projections must be equal
    const h2 = (x:number)=> ({ a:phi(x), b:psi(x) });
    const same = X.elems.every(x => R.eq(h(x).a, h2(x).a) && S.eq(h(x).b, h2(x).b));
    expect(same).toBe(true);
  });

  it("forgetful Ring→Ab: underlying additive groups behave as direct sums (finite)", () => {
    const UA = forgetAdditive(productRing(R,S));  // (R×S, +)
    // size check: |(Z2×Z3,+)| = 6
    expect(UA.elems.length).toBe(6);
    // sample addition: (1,2)+(1,1)=(0,0) in Z2×Z3
    const p = {a:1,b:2}, q = {a:1,b:1};
    const sum = UA.op(p as any, q as any) as any; // using group op = ring.add
    expect(sum.a).toBe(0);
    expect(sum.b).toBe(0);
  });
});