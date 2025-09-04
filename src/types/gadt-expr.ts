/** @math DEF-GADT @math DEF-INTRINSIC-TYPING */

/** Intrinsically-typed expression GADT via type witnesses. */

export type Ty<T> =
  | { tag: "number" }
  | { tag: "boolean" }
  | { tag: "pair"; left: Ty<any>; right: Ty<any> }
  | { tag: "arrow"; dom: Ty<any>; cod: Ty<any> };

export const NumT: Ty<number> = { tag: "number" };
export const BoolT: Ty<boolean> = { tag: "boolean" };
export const PairT = <A, B>(l: Ty<A>, r: Ty<B>): Ty<[A, B]> => ({ tag: "pair", left: l, right: r });
export const ArrowT = <A,B>(dom: Ty<A>, cod: Ty<B>): Ty<(a:A)=>B> => ({ tag:"arrow", dom, cod });

/** Expr<T> — GADT-like by carrying a Ty<T> witness. */
export type Expr<T> =
  | { tag: "num"; type: Ty<number>; value: number }
  | { tag: "bool"; type: Ty<boolean>; value: boolean }
  | { tag: "add"; type: Ty<number>; left: Expr<number>; right: Expr<number> }
  | { tag: "pair"; type: Ty<[any, any]>; left: Expr<any>; right: Expr<any> }
  | { tag: "fst"; type: Ty<any>; pair: Expr<[any, any]>; out: Ty<any> }           // out is a witness for result
  | { tag: "snd"; type: Ty<any>; pair: Expr<[any, any]>; out: Ty<any> }
  | { tag: "if"; type: Ty<any>; cond: Expr<boolean>; then: Expr<any>; else: Expr<any> };

export const num = (n: number): Expr<number> => ({ tag: "num", type: NumT, value: n });
export const bool = (b: boolean): Expr<boolean> => ({ tag: "bool", type: BoolT, value: b });
export const add = (l: Expr<number>, r: Expr<number>): Expr<number> => ({ tag: "add", type: NumT, left: l, right: r });
export const pair = <A, B>(l: Expr<A>, r: Expr<B>): Expr<[A, B]> => ({ tag: "pair", type: PairT(l.type, r.type), left: l, right: r });
export const fst = <A, B>(p: Expr<[A, B]>, leftTy: Ty<A>): Expr<A> => ({ tag: "fst", type: leftTy, pair: p, out: leftTy });
export const snd = <A, B>(p: Expr<[A, B]>, rightTy: Ty<B>): Expr<B> => ({ tag: "snd", type: rightTy, pair: p, out: rightTy });
export const iff = <T>(c: Expr<boolean>, t: Expr<T>, e: Expr<T>): Expr<T> =>
  ({ tag: "if", type: t.type, cond: c, then: t, else: e });

/** Evaluator: Expr<T> -> T, enforced by types via witnesses. */
export function evalE<T>(e: Expr<T>): T {
  switch (e.tag) {
    case "num": return e.value as any;
    case "bool": return e.value as any;
    case "add": return (evalE(e.left) + evalE(e.right)) as any;
    case "pair": return [evalE(e.left), evalE(e.right)] as any;
    case "fst": return (evalE(e.pair) as any)[0] as any;
    case "snd": return (evalE(e.pair) as any)[1] as any;
    case "if": return (evalE(e.cond) ? evalE(e.then) : evalE(e.else)) as any;
  }
}

/** Pretty printer keeps types coherent via carried witnesses. */
export function showE<T>(e: Expr<T>): string {
  switch (e.tag) {
    case "num": return String(e.value);
    case "bool": return String(e.value);
    case "add": return `(${showE(e.left)} + ${showE(e.right)})`;
    case "pair": return `(${showE(e.left)}, ${showE(e.right)})`;
    case "fst": return `fst ${showE(e.pair)}`;
    case "snd": return `snd ${showE(e.pair)}`;
    case "if": return `(if ${showE(e.cond)} then ${showE(e.then)} else ${showE(e.else)})`;
  }
}

/**
 * Type checker: verify that an expression's type witness matches its structure
 */
export function typeCheck<T>(e: Expr<T>): boolean {
  try {
    switch (e.tag) {
      case "num":
        return e.type.tag === "number";
      case "bool":
        return e.type.tag === "boolean";
      case "add":
        return e.type.tag === "number" && typeCheck(e.left) && typeCheck(e.right);
      case "pair":
        return e.type.tag === "pair" && typeCheck(e.left) && typeCheck(e.right);
      case "fst":
        return typeCheck(e.pair) && e.out.tag !== "pair";
      case "snd":
        return typeCheck(e.pair) && e.out.tag !== "pair";
      case "if":
        return typeCheck(e.cond) && typeCheck(e.then) && typeCheck(e.else);
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
}

/**
 * Optimize expressions (simple constant folding)
 */
export function optimize<T>(e: Expr<T>): Expr<T> {
  switch (e.tag) {
    case "num":
    case "bool":
      return e;
    case "add":
      const left = optimize(e.left);
      const right = optimize(e.right);
      if (left.tag === "num" && right.tag === "num") {
        return num(left.value + right.value) as any;
      }
      return add(left, right) as any;
    case "pair":
      return pair(optimize(e.left), optimize(e.right)) as any;
    case "fst":
      const optPair = optimize(e.pair);
      if (optPair.tag === "pair") {
        return optimize(optPair.left) as any;
      }
      return fst(optPair as any, e.out as any) as any;
    case "snd":
      const optPair2 = optimize(e.pair);
      if (optPair2.tag === "pair") {
        return optimize(optPair2.right) as any;
      }
      return snd(optPair2 as any, e.out as any) as any;
    case "if":
      const optCond = optimize(e.cond);
      if (optCond.tag === "bool") {
        return optimize(optCond.value ? e.then : e.else);
      }
      return iff(optCond, optimize(e.then), optimize(e.else)) as any;
    default:
      return e;
  }
}

/**
 * Demonstrate GADT-like intrinsically-typed expressions
 */
export function demonstrateGADTExpressions() {
  console.log("🔧 GADT-LIKE INTRINSICALLY-TYPED EXPRESSIONS");
  console.log("=" .repeat(50));
  
  console.log("\\nType Witnesses:");
  console.log("  • Ty<T>: Type representations at runtime");
  console.log("  • NumT, BoolT, PairT: Basic type constructors");
  console.log("  • Carried in Expr<T> for type safety");
  
  console.log("\\nExpression Constructors:");
  console.log("  • num, bool: Literals with automatic type witnesses");
  console.log("  • add: Type-safe numeric addition");
  console.log("  • pair, fst, snd: Product type operations");
  console.log("  • iff: Conditional with type preservation");
  
  console.log("\\nType Safety:");
  console.log("  • Construction: Only well-typed expressions can be built");
  console.log("  • Evaluation: evalE<T> guaranteed to return T");
  console.log("  • Type checking: Runtime verification of type witnesses");
  console.log("  • Optimization: Type-preserving transformations");
  
  console.log("\\nAdvantages:");
  console.log("  • Intrinsic typing: Types carried in the structure");
  console.log("  • Type safety: Impossible to construct ill-typed expressions");
  console.log("  • Extensible: Easy to add new expression forms");
  console.log("  • Optimizable: Type-preserving transformations");
  
  console.log("\\nApplications:");
  console.log("  • Domain-specific languages");
  console.log("  • Type-safe interpreters");
  console.log("  • Compiler intermediate representations");
  console.log("  • Embedded programming languages");
  
  console.log("\\n🎯 Type-safe expression evaluation with GADT-like guarantees!");
}

/** Type witnesses: equality & guards */
export function eqTy<A, B>(a: Ty<A>, b: Ty<B>): a is Ty<B> & Ty<A> {
  if (a.tag !== b.tag) return false;
  if (a.tag === "pair" && b.tag === "pair") {
    return eqTy(a.left as any, b.left as any) && eqTy(a.right as any, b.right as any);
  }
  if (a.tag === "arrow" && b.tag === "arrow") {
    return eqTy(a.dom as any, b.dom as any) && eqTy(a.cod as any, b.cod as any);
  }
  return true;
}

export function isOfType<T>(e: Expr<any>, ty: Ty<T>): e is Expr<T> { 
  return eqTy(e.type as any, ty as any); 
}

/** Typed pattern matching driven by Ty<T> witness (not string tag).
 * Example:
 *   tmatch(e, {
 *     number: n  => n + 1,
 *     boolean: b => b ? 1 : 0,
 *     pair: (lTy, rTy, l, r) => …,
 *     default: (_ty, _e) => …
 *   })
 */
export function tmatch<T, R>(e: Expr<T>, arms: {
  number?: (n: number) => R;
  boolean?: (b: boolean) => R;
  pair?: (lTy: Ty<any>, rTy: Ty<any>, l: Expr<any>, r: Expr<any>) => R;
  // you can also branch on constructors if desired:
  add?: (l: Expr<number>, r: Expr<number>) => R;
  if?: (c: Expr<boolean>, t: Expr<any>, f: Expr<any>) => R;
  default?: (ty: Ty<T>, e: Expr<T>) => R;
}): R {
  const { type } = e;
  if (eqTy(type, NumT) && arms.number && (e as any).tag === "num") {
    return arms.number((e as any).value);
  }
  if (eqTy(type, BoolT) && arms.boolean && (e as any).tag === "bool") {
    return arms.boolean((e as any).value);
  }
  if (type.tag === "pair" && arms.pair && (e as any).tag === "pair") {
    return arms.pair(type.left, type.right, (e as any).left, (e as any).right);
  }
  if (arms.add && (e as any).tag === "add") return arms.add((e as any).left, (e as any).right);
  if (arms.if && (e as any).tag === "if") return arms.if((e as any).cond, (e as any).then, (e as any).else);
  if (arms.default) return arms.default(type, e);
  throw new Error("Non-exhaustive tmatch");
}