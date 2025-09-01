/**
 * Type Classes Index
 * 
 * This module exports all type classes organized by category:
 * 
 * 1. HKT plumbing and basic types
 * 2. Algebraic structures and basic type classes
 * 3. Functor family and monadic structures
 * 4. Foldable, traversable, and comonad structures
 * 5. Advanced constructions (arrows, optics, etc.)
 */

// HKT plumbing and basic types
export * from './hkt';

// Algebraic structures and basic type classes
export * from './algebraic';

// Functor family and monadic structures
export * from './functors';

// Foldable, traversable, and comonad structures
export * from './foldable';

// Advanced constructions (arrows, optics, etc.)
export * from './advanced';

// Profunctor-encoded optics (free implementation) is available under a namespace.
// This prevents symbol collisions with the canonical typeclass/HKT surface.
import * as OpticsFree from './optics-free';
export { OpticsFree };
export * from './category-to-nerve-sset';

// Value-level instances and implementations
export * from './instances';
