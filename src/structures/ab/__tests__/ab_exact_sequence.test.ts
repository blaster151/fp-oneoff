import { describe, it, expect } from "vitest";
import { Zn } from "../../group/util/FiniteGroups";
import { asAbelian } from "../AbGroup";
import { exactAtMiddle } from "../AbCategory";

describe("Exactness at middle: Z2 --i--> Z4 --mod2--> Z2", () => {
  const Z2 = asAbelian(Zn(2));
  const Z4 = asAbelian(Zn(4));

  // i: Z2 → Z4, 1 ↦ 2
  const i = { source: Z2, target: Z4, f: (x:number)=> (2*x)%4 };
  // j: Z4 → Z2, x ↦ x mod 2
  const j = { source: Z4, target: Z2, f: (x:number)=> x%2 };

  it("im(i) = ker(j)", () => {
    expect(exactAtMiddle(i, j)).toBe(true);
  });
});