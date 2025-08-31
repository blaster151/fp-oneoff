/**
 * Advanced type classes and constructions
 * These include arrows, representable functors, free constructions, and optics
 */

import { HKT, Fn } from './hkt';
import { Category } from './algebraic';
import { Functor, Applicative } from './functors';

// Arrows (generalized computations beyond Monad)
export interface Arrow<P> extends Category {
  arr: <A, B>(f: Fn<A, B>) => HKT<P, [A, B]>
  first: <A, B, C>(pab: HKT<P, [A, B]>) => HKT<P, [[A, C], [B, C]]>
}

export interface ArrowChoice<P> extends Arrow<P> {
  left: <A, B, C>(pab: HKT<P, [A, B]>) => HKT<P, [A | C, B | C]>
}

export interface ArrowApply<P> extends Arrow<P> {
  app: <A, B>(p: HKT<P, [[A, HKT<P, [A, B]>], B]>) => HKT<P, [A, B]>
}

// Representable/Distributive (powerful functors)
export interface Representable<F, Rep> extends Functor<F> {
  tabulate: <A>(h: (r: Rep) => A) => HKT<F, A>
  index: <A>(fa: HKT<F, A>) => (r: Rep) => A
}

export interface Distributive<F> extends Functor<F> {
  distribute: <G, A>(G: Functor<G>, gfa: HKT<G, HKT<F, A>>) => HKT<F, HKT<G, A>>
}

// Free constructions & recursion schemes

// Monad algebra folds Free
export type Free<F, A> = { _tag: 'Pure', a: A } | { _tag: 'Suspend', fa: HKT<F, Free<F, A>> }

export interface FreeAlgebra<F> { 
  alg: <A>(fa: HKT<F, A>) => A 
}

export const foldFree = <F, A>(F: Functor<F>, alg: FreeAlgebra<F>) =>
  (fa: Free<F, A>): A =>
    fa._tag === 'Pure'
      ? fa.a
      : alg.alg(F.map(fa.fa, foldFree(F, alg)))

// Comonad coalgebra drives Cofree
export type Cofree<F, A> = { head: A, tail: HKT<F, Cofree<F, A>> }

export interface FreeCoalgebra<F> { 
  coalg: <A>(a: A) => HKT<F, A> 
}

export const unfoldCofree = <F, A>(F: Functor<F>, coalg: FreeCoalgebra<F>) =>
  (a: A): Cofree<F, A> => ({ 
    head: a, 
    tail: F.map(coalg.coalg(a), unfoldCofree(F, coalg)) 
  })

// Legacy Free monad over a functor F (keeping for backward compatibility)
export type FreeLegacy<F, A> = Pure<A> | Suspend<HKT<F, FreeLegacy<F, A>>>;

// Fixed point of a functor
export type Fix<F> = { unfix: HKT<F, Fix<F>> };

// Placeholder types for Free monad implementation
export interface Pure<A> {
  readonly _tag: 'Pure';
  readonly value: A;
}

export interface Suspend<F> {
  readonly _tag: 'Suspend';
  readonly value: F;
}

// Optics (often via profunctors)
export interface Iso<S, A> { 
  get: (s: S) => A; 
  reverseGet: (a: A) => S 
}

export interface Lens<S, A> { 
  get: (s: S) => A; 
  set: (a: A) => (s: S) => S 
}

export interface Prism<S, A> { 
  getOption: (s: S) => A | undefined; 
  reverseGet: (a: A) => S 
}

export interface Traversal<S, A> { 
  traverse: <F>(F: Applicative<F>) => (s: S, f: (a: A) => HKT<F, A>) => HKT<F, S> 
}
