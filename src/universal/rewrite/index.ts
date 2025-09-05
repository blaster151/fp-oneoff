/**
 * Oriented Rewrite Systems and Set-level Monads
 * 
 * This module provides:
 * 1. Oriented rewrite systems with canonical normal forms per theory
 * 2. Set-level monads from finitary algebraic theories
 * 
 * Features:
 * - Monoid normal forms (associative + unit, right-associative)
 * - Semilattice normal forms (ACI + unit, sorted and deduplicated)
 * - Set-level monads with unit/multiplication laws
 * - Comprehensive test coverage
 */

// Core rewrite engine
export {
  type RewriteRule,
  rule,
  key,
  normalize,
  normalizeHead,
  normalizeRecursive
} from "./Rules";

// Oriented rewrite systems
export {
  monoidNormalForm,
  semilatticeNormalForm
} from "./Oriented";

// Set-level monads
export {
  type SetMonad,
  type FreeAlgebra,
  createSetMonad,
  createMonoidSetMonad,
  createSemilatticeSetMonad,
  testMonadLaws
} from "./SetMonad";

// Re-export FiniteSet from canonical location
export { type FiniteSet } from "../../set/Set";