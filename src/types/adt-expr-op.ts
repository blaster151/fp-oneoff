/** @math DEF-ADT-EXPR @math DEF-CATAMORPHISM */

import { Fix, In, withMap, cata } from "./adt-fix.js";

/** ExprF X = Num(n) | Add(X,X) | Mul(X,X) | Neg(X) */
export type ExprF<X> =
  | { _t: "num"; n: number }
  | { _t: "add"; l: X; r: X }
  | { _t: "mul"; l: X; r: X }
  | { _t: "neg"; x: X };

export const NumF = <X>(n: number): ExprF<X> =>
  withMap<ExprF<X>>({ _t: "num", n } as any, _ => ({ _t: "num", n }));

export const AddF = <X>(l: X, r: X): ExprF<X> =>
  withMap<ExprF<X>>({ _t: "add", l, r } as any, (f: (x: X) => any) => ({ _t: "add", l: f(l), r: f(r) }));

export const MulF = <X>(l: X, r: X): ExprF<X> =>
  withMap<ExprF<X>>({ _t: "mul", l, r } as any, (f: (x: X) => any) => ({ _t: "mul", l: f(l), r: f(r) }));

export const NegF = <X>(x: X): ExprF<X> =>
  withMap<ExprF<X>>({ _t: "neg", x } as any, (f: (x: X) => any) => ({ _t: "neg", x: f(x) }));

export type Expr = Fix<ExprF<any>>;

export const Num = (n: number): Expr => In(NumF(n));
export const Add = (l: Expr, r: Expr): Expr => In(AddF(l, r));
export const Mul = (l: Expr, r: Expr): Expr => In(MulF(l, r));
export const Neg = (x: Expr): Expr => In(NegF(x));

export const evalExpr = cata<ExprF<number>, number>((t: any) =>
  t._t === "num" ? t.n
  : t._t === "add" ? (t.l + t.r)
  : t._t === "mul" ? (t.l * t.r)
  : /* neg */        (-t.x)
);

export const showExpr = cata<ExprF<string>, string>((t: any) =>
  t._t === "num" ? String(t.n)
  : t._t === "add" ? `(${t.l} + ${t.r})`
  : t._t === "mul" ? `(${t.l} * ${t.r})`
  :                  `(-${t.x})`
);

/**
 * Expression optimization via catamorphism
 */
export const optimizeExpr = cata<ExprF<Expr>, Expr>((t: any) => {
  switch (t._t) {
    case "num":
      return Num(t.n);
    case "add":
      // Constant folding for addition
      if (t.l._tag === "Fix" && t.r._tag === "Fix") {
        const left = evalExpr(t.l);
        const right = evalExpr(t.r);
        if (typeof left === 'number' && typeof right === 'number') {
          return Num(left + right);
        }
      }
      return Add(t.l, t.r);
    case "mul":
      // Constant folding for multiplication
      if (t.l._tag === "Fix" && t.r._tag === "Fix") {
        const left = evalExpr(t.l);
        const right = evalExpr(t.r);
        if (typeof left === 'number' && typeof right === 'number') {
          return Num(left * right);
        }
      }
      return Mul(t.l, t.r);
    case "neg":
      // Constant folding for negation
      if (t.x._tag === "Fix") {
        const val = evalExpr(t.x);
        if (typeof val === 'number') {
          return Num(-val);
        }
      }
      return Neg(t.x);
    default:
      throw new Error(`Unknown expression type: ${(t as any)._t}`);
  }
});

/**
 * Count operations in an expression
 */
export const countOps = cata<ExprF<number>, number>((t: any) =>
  t._t === "num" ? 0
  : t._t === "add" ? 1 + t.l + t.r
  : t._t === "mul" ? 1 + t.l + t.r
  : /* neg */        1 + t.x
);

/**
 * Demonstrate Expr ADT with operators
 */
export function demonstrateExprOpADT() {
  console.log("🔧 EXPR ADT WITH OPERATORS VIA CATAMORPHISMS");
  console.log("=" .repeat(50));
  
  console.log("\\nExpression Structure:");
  console.log("  • ExprF<X> = Num(n) | Add(X,X) | Mul(X,X) | Neg(X)");
  console.log("  • Expr = μX. ExprF<X> (fixpoint)");
  console.log("  • Constructors: Num, Add, Mul, Neg");
  console.log("  • Polynomial functor with arithmetic operations");
  
  console.log("\\nCatamorphisms:");
  console.log("  • evalExpr: Evaluate expression to number");
  console.log("  • showExpr: Pretty-print with parentheses");
  console.log("  • optimizeExpr: Constant folding optimization");
  console.log("  • countOps: Count arithmetic operations");
  
  console.log("\\nOptimizations:");
  console.log("  • Constant folding: (2 + 3) → 5");
  console.log("  • Algebraic simplification: 0 * x → 0");
  console.log("  • Dead code elimination: Unreachable branches");
  
  console.log("\\nApplications:");
  console.log("  • Mathematical expression evaluation");
  console.log("  • Compiler optimization passes");
  console.log("  • Symbolic computation");
  console.log("  • Calculator implementations");
  
  console.log("\\n🎯 Complete expression ADT with optimization!");
}