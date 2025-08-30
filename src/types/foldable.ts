/**
 * Foldable, Traversable, and Comonad type classes
 * These provide operations for consuming and transforming data structures
 */

import { HKT } from './hkt';
import { Functor, Applicative } from './functors';

// Folds and traversals
export interface Foldable<F> {
  reduce: <A, B>(fa: HKT<F, A>, b: B, f: (b: B, a: A) => B) => B
  reduceRight: <A, B>(fa: HKT<F, A>, b: B, f: (a: A, b: B) => B) => B
}

export interface Unfoldable<F> {
  unfold: <A, B>(b: B, f: (b: B) => [A, B] | null) => HKT<F, A>
}

export interface Traversable<F> extends Functor<F>, Foldable<F> {
  traverse: <G, A, B>(
    G: Applicative<G>, 
    fa: HKT<F, A>, 
    f: (a: A) => HKT<G, B>
  ) => HKT<G, HKT<F, B>>
  
  sequence: <G, A>(
    G: Applicative<G>, 
    fga: HKT<F, HKT<G, A>>
  ) => HKT<G, HKT<F, A>>
}

// Comonads (dual to monads)
export interface Extend<F> extends Functor<F> { 
  extend: <A, B>(wa: HKT<F, A>, f: (wa: HKT<F, A>) => B) => HKT<F, B> 
}

export interface Comonad<F> extends Extend<F> { 
  extract: <A>(wa: HKT<F, A>) => A 
}
