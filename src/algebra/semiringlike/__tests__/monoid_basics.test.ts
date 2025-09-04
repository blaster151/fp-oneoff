import { describe, it, expect } from "vitest";
import { checkMonoid, isMonoidHom } from "../Monoid";
import { ZnAdd, StringsOver } from "../examples/Monoids";

describe("Monoid basics", () => {
  it("ZnAdd(n) is a valid monoid", () => {
    const M = ZnAdd(5);
    const result = checkMonoid(M);
    expect(result.ok).toBe(true);
    expect(M.elems.length).toBe(5);
    expect(M.e).toBe(0);
  });

  it("StringsOver(alphabet) is a valid monoid", () => {
    const M = StringsOver(["a", "b"]);
    const result = checkMonoid(M);
    expect(result.ok).toBe(true);
    expect(M.e).toBe("");
    expect(M.op("a", "b")).toBe("ab");
  });

  it("monoid homomorphism validation", () => {
    const M1 = ZnAdd(3);
    const M2 = ZnAdd(6);
    const f = (x: number) => x * 2; // maps 0,1,2 to 0,2,4
    
    const hom = { source: M1, target: M2, f };
    expect(isMonoidHom(hom)).toBe(true);
  });
});