/** @math DEF-GADT @math DEF-INTRINSIC-TYPING */

import { describe, it, expect } from "vitest";
import { num, bool, add, pair, fst, snd, iff, evalE, showE, typeCheck, optimize, NumT, BoolT, PairT, demonstrateGADTExpressions } from "../gadt-expr.js";

describe("GADT-like intrinsically-typed Expr", () => {
  it("type-correct programs build and evaluate", () => {
    const e1 = add(num(2), num(40));               // Expr<number>
    const e2 = pair(bool(true), e1);               // Expr<[boolean, number]>
    const e3 = fst(e2, BoolT);                     // Expr<boolean>
    const e4 = iff(e3, e1, num(0));                // Expr<number>
    
    expect(evalE(e4)).toBe(42);
    expect(showE(e4)).toContain("+");
    
    console.log(`✅ Type-safe evaluation: ${showE(e4)} = ${evalE(e4)}`);
  });

  it("type checking verifies witness consistency", () => {
    const validExpr = add(num(1), num(2));
    const pairExpr = pair(bool(true), num(42));
    const conditionalExpr = iff(bool(false), num(10), num(20));
    
    expect(typeCheck(validExpr)).toBe(true);
    expect(typeCheck(pairExpr)).toBe(true);
    expect(typeCheck(conditionalExpr)).toBe(true);
    
    console.log("✅ Type checking: All well-formed expressions verified");
  });

  it("optimization preserves types and semantics", () => {
    const expr = add(num(2), add(num(3), num(5))); // 2 + (3 + 5)
    const optimized = optimize(expr);
    
    expect(evalE(expr)).toBe(evalE(optimized)); // Same semantics
    expect(typeCheck(optimized)).toBe(true); // Type preservation
    
    // Constant folding should reduce nested additions
    expect(evalE(optimized)).toBe(10);
    
    console.log(`✅ Optimization: ${showE(expr)} → ${showE(optimized)} (value: ${evalE(optimized)})`);
  });

  it("conditional expressions work with type safety", () => {
    const condition = bool(true);
    const thenBranch = add(num(10), num(5));
    const elseBranch = num(0);
    const conditional = iff(condition, thenBranch, elseBranch);
    
    expect(evalE(conditional)).toBe(15);
    expect(typeCheck(conditional)).toBe(true);
    
    console.log(`✅ Conditional: ${showE(conditional)} = ${evalE(conditional)}`);
  });

  it("pair operations maintain type safety", () => {
    const p = pair(num(42), bool(true));           // Expr<[number, boolean]>
    const first = fst(p, NumT);                    // Expr<number>
    const second = snd(p, BoolT);                  // Expr<boolean>
    
    expect(evalE(first)).toBe(42);
    expect(evalE(second)).toBe(true);
    expect(typeCheck(first)).toBe(true);
    expect(typeCheck(second)).toBe(true);
    
    console.log(`✅ Pair operations: fst ${showE(p)} = ${evalE(first)}, snd = ${evalE(second)}`);
  });

  it("demonstrates complete GADT-like system", () => {
    demonstrateGADTExpressions();
    expect(true).toBe(true); // Educational demonstration
  });

  // Note: Uncommenting the following should cause TypeScript type errors (good!):
  // it("type errors are caught at compile time", () => {
  //   const bad = add(num(1), bool(true));         // ❌ not Expr<number>
  //   const nope = fst(num(1) as any, NumT);       // ❌ requires pair
  //   expect(true).toBe(false); // Should not compile
  // });
});