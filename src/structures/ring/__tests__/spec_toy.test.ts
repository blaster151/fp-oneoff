import { describe, it, expect } from "vitest";
import { ZnRing } from "../Ring";
import { enumerateIdeals, spec, V, D, closure } from "../Spec";
import { idealGeneratedBy } from "../Ideal";

/** Spec(Z6) = {(2), (3)} in the toy (since (2) and (3) are prime, (0) not prime). */
describe("Toy Spec for finite commutative rings (Z6)", () => {
  const Z6 = ZnRing(6);

  it("enumerates ideals (includes (0), (1), (2), (3))", () => {
    const Is = enumerateIdeals(Z6, 2);
    const sizes = new Set(Is.map(I=> I.elems.length));
    expect(Is.some(I=> I.elems.length===1)).toBe(true); // (0)
    expect(Is.some(I=> I.elems.length===6)).toBe(true); // (1)
    // (2), (3) should exist
    const I2 = idealGeneratedBy(Z6, [2]);
    const I3 = idealGeneratedBy(Z6, [3]);
    const has2 = Is.some(J=> J.elems.length===I2.elems.length && J.elems.every(a=>I2.elems.some(b=>Z6.eq(a,b))));
    const has3 = Is.some(J=> J.elems.length===I3.elems.length && J.elems.every(a=>I3.elems.some(b=>Z6.eq(a,b))));
    expect(has2 && has3).toBe(true);
  });

  it("Spec(Z6) includes (2) and (3) (and possibly (1))", () => {
    const P = spec(Z6);
    console.log("Found prime ideals:", P.map(p => p.elems.sort()));
    expect(P.length).toBeGreaterThanOrEqual(2);
    const I2 = idealGeneratedBy(Z6, [2]);
    const I3 = idealGeneratedBy(Z6, [3]);
    const key = (I:any)=> JSON.stringify(I.elems.sort());
    const KS = new Set(P.map(key));
    expect(KS.has(key(I2))).toBe(true);
    expect(KS.has(key(I3))).toBe(true);
  });

  it("Zariski pieces: V((2)) and V((3)) are non-empty; D(2) excludes (2)", () => {
    const P = spec(Z6);
    const I2 = idealGeneratedBy(Z6, [2]);
    const I3 = idealGeneratedBy(Z6, [3]);
    const V2 = V(Z6, I2, P);
    const V3 = V(Z6, I3, P);
    expect(V2.length).toBeGreaterThanOrEqual(1);
    expect(V3.length).toBeGreaterThanOrEqual(1);

    const D2 = D(Z6, 2, P);
    // D(2) should not contain (2)
    const key = (I:any)=> JSON.stringify(I.elems.sort());
    const I2key = key(I2);
    const D2keys = D2.map(key);
    expect(D2keys.includes(I2key)).toBe(false);
  });
});