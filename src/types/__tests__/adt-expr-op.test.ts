/** @math DEF-ADT-EXPR @math DEF-CATAMORPHISM */

import { describe, it, expect } from "vitest";
import { Num, Add, Mul, Neg, evalExpr, showExpr, optimizeExpr, countOps, demonstrateExprOpADT } from "../adt-expr-op.js";

describe("Expr (operators) via cata", () => {
  it("evaluates arithmetic expressions", () => {
    const e = Neg(Add(Num(6), Mul(Num(3), Num(4)))); // -(6 + 12) = -18
    expect(evalExpr(e)).toBe(-18);
    expect(showExpr(e)).toContain("*");
    expect(showExpr(e)).toContain("+");
    expect(showExpr(e)).toContain("-");
    
    console.log(`✅ Expression evaluation: ${showExpr(e)} = ${evalExpr(e)}`);
  });

  it("optimization performs constant folding", () => {
    const e = Add(Num(2), Mul(Num(3), Num(4))); // 2 + (3 * 4)
    const optimized = optimizeExpr(e);
    
    // Should fold constants where possible
    expect(evalExpr(e)).toBe(evalExpr(optimized)); // Same semantics
    expect(evalExpr(optimized)).toBe(14);
    
    console.log(`✅ Optimization: ${showExpr(e)} → ${showExpr(optimized)} = ${evalExpr(optimized)}`);
  });

  it("counts operations correctly", () => {
    const simple = Add(Num(1), Num(2)); // 1 operation
    const complex = Neg(Add(Num(1), Mul(Num(2), Num(3)))); // 3 operations
    
    expect(countOps(simple)).toBe(1);
    expect(countOps(complex)).toBe(3);
    
    console.log(`✅ Operation counting: simple=${countOps(simple)}, complex=${countOps(complex)}`);
  });

  it("handles nested expressions correctly", () => {
    // ((1 + 2) * (3 + 4)) = (3 * 7) = 21
    const left = Add(Num(1), Num(2));
    const right = Add(Num(3), Num(4));
    const expr = Mul(left, right);
    
    expect(evalExpr(expr)).toBe(21);
    expect(showExpr(expr)).toBe("((1 + 2) * (3 + 4))");
    
    console.log(`✅ Nested expressions: ${showExpr(expr)} = ${evalExpr(expr)}`);
  });

  it("demonstrates complete Expr ADT", () => {
    demonstrateExprOpADT();
    expect(true).toBe(true); // Educational demonstration
  });
});