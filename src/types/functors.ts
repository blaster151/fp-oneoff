/**
 * Functor family type classes
 * These provide structure-preserving maps over type constructors
 */

import { HKT } from './hkt';

// Core functor - structure-preserving maps
export interface Functor<F> {
  map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
}

// Contravariant functor - maps in the opposite direction
export interface Contravariant<F> {
  contramap: <A, B>(fa: HKT<F, A>, f: (b: B) => A) => HKT<F, B>
}

// Invariant functor - requires both directions
export interface Invariant<F> {
  imap: <A, B>(fa: HKT<F, A>, to: (a: A) => B, from: (b: B) => A) => HKT<F, B>
}

// Bifunctor - functor in two arguments
export interface Bifunctor<F> {
  bimap: <A, B, C, D>(fab: HKT<F, [A, B]>, f: (a: A) => C, g: (b: B) => D) => HKT<F, [C, D]>
}

// Profunctor - contravariant in first argument, covariant in second
export interface Profunctor<P> {
  dimap: <A, B, C, D>(pab: HKT<P, [A, B]>, l: (c: C) => A, r: (b: B) => D) => HKT<P, [C, D]>
}

// Applicative family (effectful combination)
export interface Apply<F> extends Functor<F> {
  ap: <A, B>(ff: HKT<F, (a: A) => B>, fa: HKT<F, A>) => HKT<F, B>
}

export interface Applicative<F> extends Apply<F> {
  of: <A>(a: A) => HKT<F, A>
}

export interface Alt<F> extends Functor<F> {
  alt: <A>(x: HKT<F, A>, y: () => HKT<F, A>) => HKT<F, A>
}

export interface Plus<F> extends Alt<F> { 
  zero: <A>() => HKT<F, A> 
}

export interface Alternative<F> extends Applicative<F>, Plus<F> {}

// Monadic/Bind family (sequential composition)
export interface Chain<F> extends Apply<F> {
  chain: <A, B>(fa: HKT<F, A>, f: (a: A) => HKT<F, B>) => HKT<F, B>
}

export interface Monad<F> extends Applicative<F>, Chain<F> {}

// Common "capability" refinements
export interface MonadThrow<F, E> extends Monad<F> { 
  throwError: <A = never>(e: E) => HKT<F, A> 
}

export interface MonadError<F, E> extends MonadThrow<F, E> { 
  catchError: <A>(fa: HKT<F, A>, h: (e: E) => HKT<F, A>) => HKT<F, A> 
}

export interface MonadReader<F, R> extends Monad<F> { 
  ask: () => HKT<F, R>; 
  local: <A>(fa: HKT<F, A>, f: (r: R) => R) => HKT<F, A> 
}

export interface MonadState<F, S> extends Monad<F> { 
  get: () => HKT<F, S>; 
  put: (s: S) => HKT<F, void> 
}

export interface MonadWriter<F, W> extends Monad<F> { 
  tell: (w: W) => HKT<F, void> 
}
