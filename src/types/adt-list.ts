/** @math THM-INITIAL-ALGEBRA @math DEF-CATAMORPHISM @math EX-ADT-LIST */

import { Fix, In, Out, withMap, cata, ana, hylo, para, apo } from "./adt-fix.js";
import { inl, inr, Sum, Pair, pair } from "./adt-sum-prod.js";

/** ListF X A = 1 + (A × X) */
export type ListF<X, A> = Sum<{ _t: "nil" }, Pair<A, X>>;

export const NilF = <X, A>(): ListF<X, A> =>
  withMap<ListF<X, A>>(
    { _t: "inl", value: { _t: "nil" } } as any, 
    _ => ({ _t: "inl", value: { _t: "nil" } })
  );

export const ConsF = <X, A>(head: A, tail: X): ListF<X, A> =>
  withMap<ListF<X, A>>(
    { _t: "inr", value: pair(head, tail) } as any,
    (f: (x: X) => any) => ({ _t: "inr", value: pair(head, f(tail)) }) as any
  );

/** Fixpoint List A = μX. 1 + (A × X) */
export type List<A> = Fix<ListF<any, A>>;

export const Nil = <A>(): List<A> => In(NilF<any, A>());
export const Cons = <A>(a: A, as: List<A>): List<A> => In(ConsF<any, A>(a, as));

/** catamorphisms */
export const foldRight = <A, B>(onNil: B, onCons: (a: A, b: B) => B) =>
  cata<ListF<B, A>, B>((fa: any) =>
    fa._t === "inl" ? onNil : onCons(fa.value.fst, fa.value.snd)
  );

export const foldLeft = <A, B>(onNil: B, onCons: (b: B, a: A) => B) =>
  (xs: List<A>): B => {
    const go = (acc: B, ys: List<A>): B => {
      const unfolded = Out(ys);
      return unfolded._t === "inl" ? acc : go(onCons(acc, unfolded.value.fst), unfolded.value.snd);
    };
    return go(onNil, xs);
  };

/** helpers */
export const toArray = <A>(xs: List<A>): A[] =>
  foldRight<A, A[]>([], (a, acc) => [a, ...acc])(xs);

export const fromArray = <A>(arr: A[]): List<A> =>
  arr.reduceRight((acc, a) => Cons(a, acc), Nil<A>());

export const length = <A>(xs: List<A>): number =>
  foldRight<A, number>(0, (_, n) => n + 1)(xs);

export const map = <A, B>(f: (a: A) => B): (xs: List<A>) => List<B> =>
  foldRight<A, List<B>>(Nil<B>(), (a, acc) => Cons(f(a), acc));

export const filter = <A>(pred: (a: A) => boolean): (xs: List<A>) => List<A> =>
  foldRight<A, List<A>>(Nil<A>(), (a, acc) => pred(a) ? Cons(a, acc) : acc);

export const append = <A>(xs: List<A>, ys: List<A>): List<A> =>
  foldRight<A, List<A>>(ys, (a, acc) => Cons(a, acc))(xs);

/** ana: unfold from a seed using (step) that returns None or Some([head, seed']) */
export const unfold = <A>(step: (s: any) => ({ done: true } | { done: false; head: A; next: any })) =>
  ana<ListF<any, A>, any>((s: any) => {
    const r = step(s);
    return r.done ? NilF<any, A>() : ConsF<any, A>(r.head, r.next);
  });

/** hylo: e.g., sum an array without constructing List */
export const hyloSum = (xs: number[]): number =>
  hylo<ListF<any, number>, [number[], number], number>(
    (fa: any) => fa._t === "inl" ? 0 : fa.value.fst + fa.value.snd,
    ([arr, _]: [number[], number]) => arr.length === 0
      ? NilF<any, number>()
      : ConsF<any, number>(arr[0]!, [arr.slice(1), 0] as any)
  )([xs, 0]);

/** para: length seeing original tails (demo) */
export const lengthPara = <A>(as: List<A>): number =>
  para<ListF<any, A>, number>((fp: any) => fp._t === "inl" ? 0 : 1 + fp.value.snd[1])(as);

/** apo: build a list with a "shortcut" to splice a prebuilt suffix */
export const unfoldWithSuffix = <A>(
  step: (s: any) => ({ done: true } | { done: false; head: A; next: any } | { splice: List<A> })
) =>
  apo<ListF<any, A>, any>((s: any) => {
    const r = step(s);
    if ('splice' in r) return ConsF<any, A>(undefined as any, { _t: "inl", value: r.splice } as any); // inl prebuilt
    if (r.done) return NilF();
    return ConsF(r.head, { _t: "inr", value: r.next } as any);
  });

/**
 * Demonstrate List ADT and catamorphisms
 */
export function demonstrateListADT() {
  console.log("🔧 LIST ADT VIA INITIAL ALGEBRA μX.1+(A×X)");
  console.log("=" .repeat(50));
  
  console.log("\\nList Construction:");
  console.log("  • ListF<X,A> = 1 + (A × X) (polynomial functor)");
  console.log("  • List<A> = μX. ListF<X,A> (fixpoint)");
  console.log("  • Nil: 1 → List<A> (empty list)");
  console.log("  • Cons: A × List<A> → List<A> (prepend)");
  
  console.log("\\nCatamorphisms:");
  console.log("  • foldRight: (B, (A,B)→B) → List<A> → B");
  console.log("  • foldLeft: (B, (B,A)→B) → List<A> → B");
  console.log("  • Structural recursion over List spine");
  
  console.log("\\nList Operations:");
  console.log("  • length: Count elements via fold");
  console.log("  • map: Transform elements via fold");
  console.log("  • filter: Select elements via fold");
  console.log("  • append: Concatenate via fold");
  
  console.log("\\nConversions:");
  console.log("  • toArray/fromArray: Bridge to native arrays");
  console.log("  • Preserves structure and semantics");
  
  console.log("\\n🎯 Complete List ADT with categorical foundation!");
}