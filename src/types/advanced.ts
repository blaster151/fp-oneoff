/**
 * Advanced type classes and constructions
 * These include arrows, representable functors, free constructions, and optics
 */

import { HKT, HKT2Prof, Either } from './hkt';
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

// ----- Profunctor & friends (arity-2 HKT) -----
export interface Profunctor2<P> {
  dimap: <A, B, C, D>(pab: HKT2Prof<P, A, B>, l: (c: C) => A, r: (b: B) => D) => HKT2Prof<P, C, D>
}

export interface Strong<P> extends Profunctor2<P> {
  first: <A, B, C>(pab: HKT2Prof<P, A, B>) => HKT2Prof<P, [A, C], [B, C]>
}

export interface Choice<P> extends Profunctor2<P> {
  left: <A, B, C>(pab: HKT2Prof<P, A, B>) => HKT2Prof<P, Either<A, C>, Either<B, C>>
}

// Optional, for completeness:
export interface Closed<P> extends Profunctor2<P> {
  closed: <A, B, C>(pab: HKT2Prof<P, A, B>) => HKT2Prof<P, (c: C) => A, (c: C) => B>
}

// Profunctor-encoded optics (rank-2)
// General pattern: an optic says: for every P with capability X, lift p A B to p S T.
export type POptic<P, S, T, A, B> = (P: any) => (pab: HKT2Prof<P, A, B>) => HKT2Prof<P, S, T>

export type PIso<S, T, A, B> = <P>(P: Profunctor2<P>) => (pab: HKT2Prof<P, A, B>) => HKT2Prof<P, S, T>
export type PLens<S, T, A, B> = <P>(P: Strong<P>) => (pab: HKT2Prof<P, A, B>) => HKT2Prof<P, S, T>
export type PPrism<S, T, A, B> = <P>(P: Choice<P>) => (pab: HKT2Prof<P, A, B>) => HKT2Prof<P, S, T>
// Traversal needs a stronger capability (Wander/Traversing). We'll add it below.

// Smart constructors (equational, tiny but powerful)
export const iso = <S, T, A, B>(
  get: (s: S) => A,
  rev: (b: B) => T
): PIso<S, T, A, B> =>
  <P>(P: Profunctor2<P>) => pab =>
    P.dimap(pab, get, rev)

// LENS (the textbook Strong-based definition)
export const lens = <S, T, A, B>(
  get: (s: S) => A,
  set: (s: S, b: B) => T
): PLens<S, T, A, B> =>
  <P>(P: Strong<P>) => pab =>
    P.dimap(
      P.first(pab),
      (s: S): [A, S] => [get(s), s],
      ([b, s]: [B, S]): T => set(s, b)
    )

// PRISM (Choice-based)
export const prism = <S, T, A, B>(
  match: (s: S) => Either<A, T>,     // Left: focus A, Right: already T
  build: (b: B) => T
): PPrism<S, T, A, B> =>
  <P>(P: Choice<P>) => pab =>
    P.dimap(
      P.left(pab),
      match,
      (e: Either<B, T>) => e._tag === 'Left' ? build(e.left) : e.right
    )

// ----- Running optics: concrete profunctors you'll actually use -----

// Function profunctor instance
type Fn<A, B> = (a: A) => B
type PFN = 'PFN'
type P2<A, B> = HKT2Prof<PFN, A, B> & ((a: A) => B) // pretend HKT2Prof==function here for brevity

const FunctionStrong: Strong<PFN> = {
  dimap: (pab: P2<any, any>, l, r) => (c: any) => r(pab(l(c))),
  first: (pab: P2<any, any>) => ([a, c]: [any, any]) => [pab(a), c]
}

// Forget profunctor (for getting/folding)
type Forget<R, A, B> = (a: A) => R
type PFG = 'PFG'
type FG<R, A, B> = HKT2Prof<PFG, A, B> & ((a: A) => R)

const ForgetProfunctor = <R>(): Profunctor2<PFG> => ({
  dimap: (pab: FG<R, any, any>, l, _r) => (c: any) => pab(l(c))
})

const ForgetStrong = <R>(): Strong<PFG> => ({
  ...ForgetProfunctor<R>(),
  first: (pab: FG<R, any, any>) => ([a, _]: [any, any]) => pab(a)
})

const ForgetChoice = <R>(): Choice<PFG> => ({
  ...ForgetProfunctor<R>(),
  left: (pab: FG<R, any, any>) => (e: Either<any, any>) => e._tag === 'Left' ? pab(e.left) : (undefined as any as R)
})

// Helpers
// over: apply function to focus
export const over = <S, T, A, B>(o: PLens<S, T, A, B> | PPrism<S, T, A, B>, f: (a: A) => B) =>
  o(FunctionStrong as any)(f as any) as (s: S) => T

export const set = <S, T, A>(o: PLens<S, T, A, A>, b: A) =>
  over(o, _ => b)

// view (lens): use Forget with R=A
export const view = <S, A>(o: PLens<S, S, A, A>) =>
  (s: S): A => o(ForgetStrong<A>())((a: A) => a)(s) as any

// ----- Traversals with a profunctor (Wander/Traversing) -----

// Star<F, A, B> ~ A => F<B>
type Star<F, A, B> = (a: A) => HKT<F, B>
type PSTAR = 'PSTAR'

interface Wander<P> extends Strong<P>, Choice<P> {
  wander: <F>(F: Applicative<F>) =>
    <S, T, A, B>(traverse: (s: S, f: (a: A) => HKT<F, B>) => HKT<F, T>, pab: HKT2Prof<P, A, B>) => HKT2Prof<P, S, T>
}

// Helper functions for Either
const left = <L, R>(l: L): Either<L, R> => ({ _tag: 'Left', left: l })
const right = <L, R>(r: R): Either<L, R> => ({ _tag: 'Right', right: r })

// Star instance is Traversing/Wander-capable
const StarWander: Wander<PSTAR> = {
  dimap: (pab, l, r) => (c: any) => (pab as any)(l(c)).map(r),
  first: (pab) => ([a, c]: [any, any]) => (pab as any)(a).map((b: any) => [b, c]),
  left: (pab) => (e: Either<any, any>) => e._tag === 'Left' ? (pab as any)(e.left).map(left) : of(right(e.right)),
  // generic wander: push Star under a user-provided traverse
  wander: <F>(F: Applicative<F>) =>
    <S, T, A, B>(tr, pab) =>
      ((s: S) => tr(s, (a: A) => (pab as any)(a))) as any
}

// A concrete Traversal over arrays ("each")
export type PTraversal<S, T, A, B> = <P>(P: Wander<P>) => (pab: HKT2Prof<P, A, B>) => HKT2Prof<P, S, T>

export const each = <A, B>(): PTraversal<ReadonlyArray<A>, ReadonlyArray<B>, A, B> =>
  <P>(P: Wander<P>) =>
    (pab: HKT2Prof<P, A, B>) =>
      P.wander(arrayApplicative)(
        (as, f) => as.reduce(
          (acc, a) => arrayAp(acc.map((bs: any[]) => (b: B) => [...bs, b]), f(a)),
          arrayOf<B[]>([])
        ).map((bs: any[]) => bs as ReadonlyArray<B>),
        pab
      )

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

// ----- Additional Free structures -----

// Free Monad (for any functor F)
export const pure = <F, A>(a: A): Free<F, A> => ({ _tag: 'Pure', a })

export const liftF = <F, A>(fa: HKT<F, A>): Free<F, A> =>
  ({ _tag: 'Suspend', fa: mapF(fa, pure) }) // needs Functor<F>

// Free Applicative (for "static" effects/validation)
export type FreeAp<F, A> =
  | { _tag: 'Pure'; a: A }
  | { _tag: 'Ap'; fab: HKT<F, any>; fa: FreeAp<F, (x: any) => A> }

export const apAp = <F, A, B>(ff: FreeAp<F, (a: A) => B>, fa: FreeAp<F, A>): FreeAp<F, B> =>
  ff._tag === 'Pure'
    ? mapAp(fa, ff.a)
    : { _tag: 'Ap', fab: ff.fab, fa: apAp(ff.fa, fa) }

// Interpret with an Applicative handler for F
export const foldFreeAp = <F>(F: Applicative<F>) =>
  <A>(nt: <X>(fx: HKT<F, X>) => HKT<F, X>) =>
  (fa: FreeAp<F, A>): HKT<F, A> =>
    fa._tag === 'Pure'
      ? F.of(fa.a)
      : F.ap(F.map(nt(fa.fab), (f: any) => (g: (x: any) => A) => (x: any) => g(f(x))), foldFreeAp(F)(nt)(fa.fa))

// Coyoneda (free functor) — get a Functor for anything
export type Coyoneda<F, A> = { fea: HKT<F, any>; k: (x: any) => A }

export const liftCoy = <F, A>(fa: HKT<F, A>): Coyoneda<F, A> => ({ fea: fa, k: (x: any) => x })

export const lowerCoy = <F>(F: Functor<F>) =>
  <A>(c: Coyoneda<F, A>): HKT<F, A> => F.map(c.fea, c.k)

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
