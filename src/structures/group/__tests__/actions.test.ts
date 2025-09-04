import { describe, it, expect } from "vitest";
import { Z3 } from "../util/FiniteGroups";
import { isAction, leftRegular, conjugation } from "../actions/Action";

describe("Group actions", () => {
  it("left-regular and conjugation actions are valid", () => {
    const L = leftRegular(Z3);
    expect(isAction(L)).toBe(true);
    const C = conjugation(Z3);
    expect(isAction(C)).toBe(true);
    // abelian sanity: conjugation is trivial
    for (const g of Z3.elems) for (const x of Z3.elems) {
      expect(Z3.eq(C.act(g,x), x)).toBe(true);
    }
  });
});