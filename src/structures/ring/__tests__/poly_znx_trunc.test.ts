import { describe, it, expect } from "vitest";
import { PolyRing, evalHom } from "../Poly";
import { checkRingLaws, ZnRing } from "../Ring";

describe("Polynomial ring Z/n[x]/(x^{d+1}) and evaluation homs", () => {
  it("Z2[x]/(x^3) is a ring and eval at a=0 is a ring hom", () => {
    const R = PolyRing(2,2); // terms up to x^2
    const ok = checkRingLaws(R);
    expect(ok.ok).toBe(true);

    const ev0 = evalHom(2,2,0);
    // preserve 0 and 1
    expect(ev0.target.eq(ev0.f(R.zero), ev0.target.zero)).toBe(true);
    expect(ev0.target.eq(ev0.f(R.one),  ev0.target.one)).toBe(true);

    // sample (+, *) preservation on a few polynomials
    const p = { coeffs:[1,1,0], n:2, d:2 }; // 1 + x
    const q = { coeffs:[0,1,1], n:2, d:2 }; // x + x^2
    const add = R.add(p,q), mul = R.mul(p,q);
    expect(ev0.target.eq(ev0.f(add), ev0.target.add(ev0.f(p), ev0.f(q)))).toBe(true);
    expect(ev0.target.eq(ev0.f(mul), ev0.target.mul(ev0.f(p), ev0.f(q)))).toBe(true);
  });

  it("Z6[x]/(x^2): evaluation at a=2 respects multiplication modulo 6", () => {
    const R = PolyRing(6,1); // up to x^1
    const ev2 = evalHom(6,1,2);
    const p = { coeffs:[2,3], n:6, d:1 }; // 2 + 3x
    const q = { coeffs:[1,4], n:6, d:1 }; // 1 + 4x
    const lhs = ev2.f(R.mul(p,q));
    const rhs = (ev2.f(p) * ev2.f(q)) % 6;
    expect(lhs).toBe(((rhs%6)+6)%6);
  });
});