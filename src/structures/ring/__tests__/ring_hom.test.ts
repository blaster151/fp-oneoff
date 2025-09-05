import { describe, it, expect } from "vitest";
import { ZnRing } from "../Ring";
import { isRingHom } from "../RingHom";

describe("Ring hom: Z6 -> Z3 (mod 3)", () => {
  const Z6 = ZnRing(6);
  const Z3 = ZnRing(3);

  const phi = {
    source: Z6,
    target: Z3,
    f: (x:number)=> x % 3
  };

  it("preserves 0,1,+,*", () => {
    expect(isRingHom(phi)).toBe(true);
  });
});