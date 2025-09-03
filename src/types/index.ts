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
export { 
  Surjection, mkSurjection, getSurjection, getSection,
  // Note: verifySurjection exported from spec-impl.js, avoiding conflict
} from './surjection-types.js';

// Double lax functor interface for categorical abstractions
export { 
  DoubleLaxFunctor,
  // Note: Square, checkDoubleFunctorLaws exported from category-to-nerve-sset.js, avoiding conflict
  inclusionWitness as doubleLaxInclusionWitness
} from './double-lax-functor-interface.js';

// Refactored SpecImpl as explicit DoubleLaxFunctor
export { 
  SpecImplFunctor,
  createSpecImplFunctor,
  verifySpecImplFunctor,
  // Note: ObjPair, numericRangeAbstraction exported from spec-impl.js, avoiding conflict
} from './spec-impl-refactored.js';

// Strong monads with Eilenberg-Moore algebras and monoids
import * as StrongMonads from './strong-monad.js';
export { StrongMonads };

// Unified witness system for counterexample reporting
export * from './witnesses.js';

// Enhanced relational law checking with witnesses
// Note: Functions are internal, witness types exported from witnesses.js
// export * from './rel-lawcheck-witnessed.js'; // Commented to avoid conflicts

// Witnessful allegory and Hoare logic
export { 
  allegoryLawWitness,
  equipmentWitness,
  wpTransportWitness,
  spTransportWitness,
  modularLawWitness,
  // Note: squareWitness exported from witnesses.js, avoiding conflict
} from './allegory-witness.js';

// Continuation monad with CPS utilities and delimited control
import * as Cont from './cont.js';
export { Cont };

// Delimited continuations with shift/reset operators
import * as ShiftReset from './shift-reset.js';
export { ShiftReset };

// CPS namespace combining continuation and delimited control
export const CPS = {
  ...Cont,
  ...ShiftReset
};

// Kan extensions with pointwise Right Kan extension implementation
import * as Kan from './kan-index.js';
export { Kan };

// Codensity monad using Right Kan extensions (Ran_G G)
import * as Codensity from './codensity-index.js';
export { Codensity };

// Mini FinSet category for ultrafilter applications
import * as MiniFinSet from './mini-finset.js';
export { MiniFinSet };

// Ultrafilter construction from codensity monads
import * as Ultrafilter from './ultrafilter.js';
export { Ultrafilter };

// Ultrafilter monad wrapper (codensity of FinSet inclusion)
import * as UltrafilterMonad from './ultrafilter-monad.js';
export { UltrafilterMonad };

// Discrete EM algebra for ultrafilter monad on compact Hausdorff spaces
import * as EMAlgebraDiscrete from './em-algebra-discrete.js';
export { EMAlgebraDiscrete };

// Nat/End bridge for codensity monads
import * as CodensityNatBridge from './codensity-nat-bridge.js';
export { CodensityNatBridge };

// Ultrafilter Nat bridge for Boolean component interpretation
import * as UltrafilterNatBridge from './ultrafilter-nat-bridge.js';
export { UltrafilterNatBridge };

// Minimal finite topology (discrete/indiscrete, continuity)
import * as Topology from './topology.js';
export { Topology };

// Ultrafilter convergence and EM algebra via limits
import * as TopologyConvergence from './topology-convergence.js';
export { TopologyConvergence };

// Finite vector spaces over F₂ (double dualization example)
import * as FinVect from './finvect.js';
export { FinVect };

// Presheaf categories and contravariant functors
import * as Presheaf from './presheaf.js';
export { Presheaf };

// Yoneda embedding and Yoneda lemma
import * as Yoneda from './yoneda.js';
export { Yoneda };

// Copresheaf categories and covariant functors
import * as Copresheaf from './copresheaf.js';
export { Copresheaf };

// Isbell duality: O and Spec conjugates
import * as Isbell from './isbell.js';
export { Isbell };

// 2-category interface and structures
import * as TwoCategory from './two-category.js';
export { TwoCategory };

// 2-category Cat (categories, functors, natural transformations)
import * as Cat2 from './cat2.js';
export { Cat2 };

// Finite colimits in FinSet (coproduct, coequalizer, pushout)
import * as FinSetColimits from './finset-colimits.js';
export { FinSetColimits };

// Finite colimits in Presheaf categories (pointwise)
import * as PresheafColimits from './presheaf-colimits.js';
export { PresheafColimits };

// Value-level instances and implementations
export * from './instances.js';
