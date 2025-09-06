/**
 * Algebraic structures and basic type classes
 * These provide the foundation for working with values and functions
 */

import { Fn, HKT } from './hkt';

// Set-like basics (no structure yet)
export interface Eq<A> { 
  equals: (x: A, y: A) => boolean 
}

export interface Show<A> { 
  show: (a: A) => string 
}

export interface Ord<A> extends Eq<A> { 
  compare: (x: A, y: A) => -1 | 0 | 1 
}

// Basic algebra on values
export interface Semigroup<A> { 
  concat: (x: A, y: A) => A 
}

export interface Monoid<A> extends Semigroup<A> { 
  empty: A 
}

// Group interface removed - use canonical FiniteGroup from structures/group/Group.ts

export interface Semiring<A> { 
  add: (x: A, y: A) => A; 
  zero: A; 
  mul: (x: A, y: A) => A; 
  one: A 
}

export interface Ring<A> extends Semiring<A> { 
  sub: (x: A, y: A) => A 
}

export interface MeetSemilattice<A> { 
  meet: (x: A, y: A) => A 
}

export interface JoinSemilattice<A> { 
  join: (x: A, y: A) => A 
}

export interface Lattice<A> extends MeetSemilattice<A>, JoinSemilattice<A> {}

export interface BoundedLattice<A> extends Lattice<A> { 
  top: A; 
  bottom: A 
}

export interface HeytingAlgebra<A> {
  implies: (x: A, y: A) => A; 
  meet: (x: A, y: A) => A; 
  join: (x: A, y: A) => A; 
  top: A; 
  bottom: A; 
  not: (a: A) => A
}

// Category fundamentals (morphisms/functions)
export interface Semigroupoid {
  compose: <A, B, C>(bc: Fn<B, C>, ab: Fn<A, B>) => Fn<A, C>
}

export interface Category extends Semigroupoid {
  id: <A>() => Fn<A, A>
}

// Action of a monoid on a set
// Laws: act(one, a) = a; act(m1 ⋅ m2, a) = act(m1, act(m2, a))
export interface Action<M, A> { 
  act: (m: M, a: A) => A 
}

// Algebras for monads (T-algebras, often called modules in monad literature)
// Given a monad T, an algebra collapses one layer of T
// This is exactly what interpreters for Free<F, A> are built from
export interface Algebra<T> { 
  fold: <A>(ta: HKT<T, A>) => A 
}

// Coalgebras / Comodules for comonads
// Dually, for a comonad W
export interface Coalgebra<W> { 
  unfold: <A>(a: A) => HKT<W, A> 
}

// At the functor level, a (co)module is a natural transformation 
// compatible with (co)monad structure

// Left T-module: M ∘ T ⇒ M
export interface LeftModule<T, M> {
  act: <A>(mta: HKT<M, HKT<T, A>>) => HKT<M, A>
}

// Left W-comodule: M ⇒ W ∘ M
export interface LeftComodule<W, M> {
  coact: <A>(ma: HKT<M, A>) => HKT<W, HKT<M, A>>
}
