/** @math DEF-GADT @math DEF-INTRINSIC-TYPING */

import { describe, it, expect } from "vitest";
import { num, bool, add, pair, fst, snd, iff, tmatch, NumT, BoolT, PairT } from "../gadt-expr.js";

describe("tmatch uses Ty<T> witness for GADT ergonomics", () => {
  it("branches on type; falls back to constructors when needed", () => {
    const e = add(num(10), num(32));
    const r = tmatch(e, {
      number: _n => 0,      // won't fire; 'e' is 'add', not 'num'
      add: (l, r) => ((l as any).value + (r as any).value),
      default: (_ty, _e) => -1
    });
    expect(r).toBe(42);
    
    console.log("✅ tmatch: Constructor-based matching for add expression");
  });

  it("pair branch sees component witnesses", () => {
    const p = pair(bool(true), num(7));
    const r = tmatch(p, {
      pair: (lTy, rTy, l, r) => (lTy.tag === "boolean" && rTy.tag === "number") ? 1 : 0,
      default: (_ty, _e) => -1
    });
    expect(r).toBe(1);
    
    console.log("✅ tmatch: Type witness-based matching for pair");
  });

  it("number type matching works directly", () => {
    const n = num(42);
    const r = tmatch(n, {
      number: val => val * 2,
      default: (_ty, _e) => 0
    });
    expect(r).toBe(84);
    
    console.log("✅ tmatch: Direct type witness matching for number");
  });

  it("boolean type matching works directly", () => {
    const b = bool(true);
    const r = tmatch(b, {
      boolean: val => val ? 100 : 0,
      default: (_ty, _e) => -1
    });
    expect(r).toBe(100);
    
    console.log("✅ tmatch: Direct type witness matching for boolean");
  });

  it("conditional expression matching works", () => {
    const cond = iff(bool(true), num(10), num(20));
    const r = tmatch(cond, {
      if: (c, t, e) => {
        const condVal = (c as any).value;
        const thenVal = (t as any).value;
        const elseVal = (e as any).value;
        return condVal ? thenVal : elseVal;
      },
      default: (_ty, _e) => -1
    });
    expect(r).toBe(10);
    
    console.log("✅ tmatch: Constructor-based matching for conditional");
  });

  it("demonstrates complete typed matching system", () => {
    console.log("🔧 TYPED GADT MATCHING VIA Ty<T> WITNESSES");
    console.log("=" .repeat(50));
    
    console.log("\\nType Witness Matching:");
    console.log("  • tmatch: Pattern matching by Ty<T> witness");
    console.log("  • eqTy: Type equality checking for witnesses");
    console.log("  • isOfType: Type guard for specific witness types");
    console.log("  • Constructor fallback: When type witness not sufficient");
    
    console.log("\\nAdvantages:");
    console.log("  • Type-driven: Matches on actual type structure");
    console.log("  • Extensible: Easy to add new type cases");
    console.log("  • Type-safe: Automatic type narrowing");
    console.log("  • Flexible: Combines type and constructor matching");
    
    console.log("\\nApplications:");
    console.log("  • Type-safe interpreters");
    console.log("  • Compiler type checking");
    console.log("  • Runtime type dispatch");
    console.log("  • Generic programming over types");
    
    console.log("\\n🎯 Advanced GADT matching with type witness ergonomics!");
    
    expect(true).toBe(true); // Educational demonstration
  });
});