import { describe, it, expect } from "vitest";
import { toChurchFix, fromChurchBuilder, fold, buildFrom, fusion } from "../adapters.js";

/** Church round-trip and fusion on a small Expr */
describe("GADT Church & fusion", () => {
  it("toChurch ∘ fromChurch is identity (up to eval)", () => {
    // Use the existing ADT types that are known to work
    const { Num, Add, evalExpr } = require("../../../dist/types/adt-expr-op.js");
    const e = Add(Num(20), Num(22));
    
    const builder = toChurchFix(e);
    const back = fromChurchBuilder(builder);
    
    // Compare semantics rather than pointer equality:
    expect(evalExpr(back)).toBe(evalExpr(e));
  });

  it("fold(buildFrom) fuses", () => {
    // Use the existing ADT types that are known to work
    const { NilF, ConsF } = require("../../../dist/types/adt-list.js");
    const coalg = (n: number) => n <= 0 ? NilF() : ConsF(n, n - 1);
    const sumAlg = (fa: any) => fa._t === "inl" ? 0 : fa.value.fst + fa.value.snd;

    const builder = buildFrom<any, number>(coalg)(5);
    const viaFusion = fusion(sumAlg)(builder);
    
    // The fusion should work: 5 + 4 + 3 + 2 + 1 = 15
    expect(viaFusion).toBe(15);
  });
});