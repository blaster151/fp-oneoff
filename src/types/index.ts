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
 * 6. Category theory and adjunction theory
 */

// HKT plumbing and basic types
export * from './hkt.js';

// Algebraic structures and basic type classes
export * from './algebraic.js';

// Functor family and monadic structures
export * from './functors.js';

// Foldable, traversable, and comonad structures
export * from './foldable.js';

// Advanced constructions (arrows, optics, etc.)
export * from './advanced.js';

// Profunctor-encoded optics (free implementation) is available under a namespace.
// This prevents symbol collisions with the canonical typeclass/HKT surface.
import * as OpticsFree from './optics-free.js';
export { OpticsFree };
export * from './category-to-nerve-sset.js';

// Category theory and adjunction theory (hom-set companions/conjoints, mates)
// Note: Some types from catkit-adjunction conflict with existing types
// export * from './catkit-adjunction.js';

// Kan extensions via ends/coends
// Note: Some types from catkit-kan conflict with existing types  
// export * from './catkit-kan.js';

// Catkit optics (profunctor lenses) - use namespace to avoid conflicts
import * as CatkitOptics from './catkit-optics.js';
export { CatkitOptics };

// Catkit prisms (profunctor prisms with Choice) - use namespace to avoid conflicts
import * as CatkitPrisms from './catkit-prisms.js';
export { CatkitPrisms };

// Catkit traversals (profunctor traversals with Wander + unified helpers) - use namespace to avoid conflicts
import * as CatkitTraversal from './catkit-traversal.js';
export { CatkitTraversal };

// Equality helpers - use namespace to avoid conflicts
import * as Eq from './eq.js';
export { Eq };

// Homology computation for nerves and chain complexes - use namespace to avoid conflicts
import * as Homology from './catkit-homology.js';
export { Homology };

// Bridge between nerve construction and homology computation
export * from './catkit-homology-bridge.js';

// Value-level instances and implementations
export * from './instances.js';
