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

// Comma categories and slice/coslice constructions
import * as CommaCategories from './catkit-comma-categories.js';
export { CommaCategories };

// Posets as thin categories with Galois connections
import * as Posets from './catkit-posets.js';
export { Posets };

// Integration bridge between comma categories and Kan extensions
export * from './catkit-comma-kan-bridge.js';

// Quasi-category checking and inner horn enumeration
import * as QuasiCategory from './sset-quasicat.js';
export { QuasiCategory };

// Bridge between nerve construction and quasi-category checking
export * from './nerve-quasicat-bridge.js';

// Relational equipment: double category of relations with allegory structure
import * as Relations from './rel-equipment.js';
export { Relations };

// Relational law checking: property testing suite for mathematical correctness
import * as RelLawCheck from './rel-lawcheck.js';
export { RelLawCheck };

// Optics-driven program rewriting with Free DSL and rule registry
import * as OpticsRewrite from './optics-rewrite.js';
export { OpticsRewrite };

// Bridge between rewrite system and existing optics infrastructure
export * from './optics-rewrite-bridge.js';

// Modern FreeApplicative + Coyoneda effect system with natural transformations
import * as Effects from './freeapp-coyo.js';
export { Effects };

// Quiver pushouts and coequalizers for schema/graph merging
import * as QuiverPushout from './quiver-pushout.js';
export { QuiverPushout };

// Double categories and 2D reasoning with strict and lax double functors
import * as DoubleFunctor from './double-functor.js';
export { DoubleFunctor };

// Interfaces for double categories and lax double functors
import * as DoubleLax from './double-lax-functor.js';
export { DoubleLax };

// High-performance bit-packed relations for large-scale computation
import * as BitRel from './bitrel.js';
export { BitRel };

// Persistent sequences with FingerTree for efficient manipulation
import * as FingerTree from './fingertree.js';
export { FingerTree };

// Common interface for Rel/BitRel with drop-in factory pattern
export * from './rel-common.js';

// Measured FingerTree with monoidal measures for indexed operations
import * as MeasuredFingerTree from './measured-fingertree.js';
export { MeasuredFingerTree };

// Rope persistent text structure built on measured FingerTree
import * as Rope from './rope.js';
export { Rope };

// Spec→Impl abstraction functors with inclusion-based verification
export * from './spec-impl.js';

// Proper surjection types with witness evidence
export * from './surjection-types.js';

// Double lax functor interface for categorical abstractions
export * from './double-lax-functor-interface.js';

// Refactored SpecImpl as explicit DoubleLaxFunctor
export * from './spec-impl-refactored.js';

// Strong monads with Eilenberg-Moore algebras and monoids
import * as StrongMonads from './strong-monad.js';
export { StrongMonads };

// Unified witness system for counterexample reporting
export * from './witnesses.js';

// Enhanced relational law checking with witnesses
export * from './rel-lawcheck-witnessed.js';

// Witnessful allegory and Hoare logic
export * from './allegory-witness.js';

// Value-level instances and implementations
export * from './instances.js';
