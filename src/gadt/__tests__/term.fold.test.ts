import { describe, it, expect } from "vitest";
import { NumT, BoolT, PairT } from "../../types/gadt-expr.js";
import { Const, Pair, App, evalTerm, showTerm, termInc } from "../examples/Term.js";

describe("Term GADT via higher-order functor + fold", () => {
  it("evaluates basic app", () => {
    const t = termInc();
    expect(evalTerm(t)).toBe(42);
  });

  it("pairs carry mixed indices", () => {
    const b = Const(BoolT, true);
    const n = Const(NumT, 7);
    const p = Pair(BoolT, NumT, b, n);
    const v = evalTerm(p);
    expect(v).toEqual([true, 7]);
    expect(showTerm(p)).toContain("Pair(boolean,number)");
  });
});