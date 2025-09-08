import { describe, it, expect } from "vitest";
import { SetObj, setHom } from "../SetCat";

describe("Set mono/epi/iso witnesses", () => {
  const A = SetObj([0,1,2], { name: "A" });
  const B = SetObj(["a","b"], { name: "B" });
  const C = SetObj([10,20,30], { name: "C" });

  test("injective not surjective", () => {
    const f = setHom(A, C, x => [10,20,30][x]!);
    expect(f.witnesses?.injective).toBe(true);
    expect(f.witnesses?.surjective).toBe(true); // A and C both size 3 → this is bijection
  });

  test("surjective not injective", () => {
    const g = setHom(A, B, x => (x % 2 === 0 ? "a" : "b"));
    expect(g.witnesses?.injective).toBe(false);
    expect(g.witnesses?.surjective).toBe(true);
    expect(g.witnesses?.isMono).toBe(false);
    expect(g.witnesses?.isEpi).toBe(true);
  });

  test("bijection gives inverse witness", () => {
    const id = setHom(B, B, x => x);
    expect(id.witnesses?.bijective).toBe(true);
    expect(id.witnesses?.inverse).toBeTruthy();
  });
});