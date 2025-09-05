import { describe, it, expect } from "vitest";
import { ZnRing, M2ZnRing, checkRingLaws } from "../Ring";

describe("Ring laws: Z6 and M2(Z2)", () => {
  const Z6 = ZnRing(6);
  const M2Z2 = M2ZnRing(2);

  it("Z6 satisfies ring axioms", () => {
    const ok = checkRingLaws(Z6);
    expect(ok.ok).toBe(true);
  });

  it("M2(Z2) satisfies ring axioms (noncommutative)", () => {
    const ok = checkRingLaws(M2Z2);
    expect(ok.ok).toBe(true);
    // check noncommutativity witness (there should be some)
    const A = {a:1,b:1,c:0,d:1}, B = {a:1,b:0,c:1,d:1};
    const AB = M2Z2.mul(A,B), BA = M2Z2.mul(B,A);
    const comm = M2Z2.eq(AB, BA);
    expect(comm).toBe(false);
  });
});