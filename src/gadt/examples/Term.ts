import { Fix, In, withMap, mapF } from "../../types/adt-fix.js";
import { Ty, NumT, BoolT, PairT, ArrowT, eqTy } from "../../types/gadt-expr.js";

/** TermF X — functor part (children are X, witnesses carried explicitly). */
export type TermF<X> =
  | { _t:"const"; ty: Ty<any>; value: any }
  | { _t:"pair";  aTy: Ty<any>; bTy: Ty<any>; left: X; right: X }
  | { _t:"app";   aTy: Ty<any>; bTy: Ty<any>; fn: X; arg: X };

const ConstF = <X>(ty:Ty<any>, value:any): TermF<X> =>
  withMap<TermF<X>>({ _t:"const", ty, value } as any, _ => ({ _t:"const", ty, value }));

const PairF = <X>(aTy:Ty<any>, bTy:Ty<any>, left:X, right:X): TermF<X> =>
  withMap<TermF<X>>({ _t:"pair", aTy, bTy, left, right } as any,
    (f:(x:X)=>any)=> ({ _t:"pair", aTy, bTy, left:f(left), right:f(right) }));

const AppF = <X>(aTy:Ty<any>, bTy:Ty<any>, fn:X, arg:X): TermF<X> =>
  withMap<TermF<X>>({ _t:"app", aTy, bTy, fn, arg } as any,
    (f:(x:X)=>any)=> ({ _t:"app", aTy, bTy, fn:f(fn), arg:f(arg) }));

/** Fixpoint carrier for Term. */
export type Term = Fix<TermF<any>>;

// Smart constructors (intrinsically typed via witnesses)
export const Const = <A>(ty:Ty<A>, value:A): Term => In(ConstF(ty, value));
export const Pair  = <A,B>(aTy:Ty<A>, bTy:Ty<B>, l:Term, r:Term): Term => In(PairF(aTy,bTy,l,r));
export const App   = <A,B>(aTy:Ty<A>, bTy:Ty<B>, fn:Term, arg:Term): Term => In(AppF(aTy,bTy,fn,arg));

/** gfold-style catamorphism (we reuse mapF from Fix). */
export const foldTerm = <A>(alg: (t: TermF<A>) => A) =>
  function go(t: Term): A {
    const node = (t as any).unfix as TermF<Term>;
    return alg(mapF(go as any, node) as any);
  };

/** Evaluator via foldTerm. */
export const evalTerm = foldTerm<any>((t:any) => {
  switch (t._t) {
    case "const": return t.value;
    case "pair":  return [t.left, t.right];
    case "app": {
      // t.fn should evaluate to a function; enforce domains via witnesses when available
      const f = t.fn as (x:any)=>any;
      return f(t.arg);
    }
  }
});

/** Pretty printer (keeps witnesses visible). */
export const showTerm = foldTerm<string>((t:any) =>
  t._t==="const" ? `Const(${t.ty.tag})`
: t._t==="pair"  ? `Pair(${t.aTy.tag},${t.bTy.tag})<${t.left},${t.right}>`
:                  `App(${t.aTy.tag}→${t.bTy.tag})<${t.fn},${t.arg}>`
);

/** Tiny demo builders */
export const termInc = () => {
  const incTy = ArrowT(NumT, NumT);
  const inc   = Const(incTy, (n:number)=> n+1);
  const arg   = Const(NumT, 41);
  return App(NumT, NumT, inc, arg); // 42
};