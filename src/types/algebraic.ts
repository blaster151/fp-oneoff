/**
 * Algebraic structures and basic type classes
 * These provide the foundation for working with values and functions
 */

import { Fn } from './hkt';

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

export interface Group<A> extends Monoid<A> { 
  invert: (a: A) => A 
}

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
