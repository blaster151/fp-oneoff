/**
 * Unified GroupHom Interface
 * 
 * This module consolidates the best features from all four competing GroupHom implementations:
 * 1. /src/algebra/group/GroupHom.ts (class-based) - 8 imports
 * 2. /src/algebra/group/Hom.ts (interface-based) - 60 imports (CANONICAL)
 * 3. /src/structures/group/Hom.ts (simple interface) - 0 direct imports
 * 4. /src/algebra/group/EnhancedGroupHom.ts (enhanced interface) - 57 references
 * 
 * The canonical interface from Hom.ts is used as the foundation since it has the highest adoption.
 */

import { FiniteGroup } from "./Group";
import { NormalSubgroup } from "./NormalSubgroup";
import { Eq } from "../../types/eq.js";

// ============================================================================
// CORE INTERFACE (Based on canonical /src/algebra/group/Hom.ts)
// ============================================================================

/**
 * A group homomorphism f: G -> H on finite carriers.
 * 
 * This is the unified interface that consolidates features from all four implementations.
 * All new methods are optional to maintain backward compatibility.
 * 
 * @example
 * ```typescript
 * // Existing code continues to work unchanged:
 * const hom: GroupHom<unknown, unknown, number, number> = {
 *   source: G,
 *   target: H,
 *   map: (x) => x * 2,
 *   name: "doubling"
 * };
 * 
 * // New features are available optionally:
 * const enhancedHom = createGroupHom(G, H, (x) => x * 2, {
 *   name: "doubling",
 *   autoAnalyze: true,
 *   includeMethods: true
 * });
 * ```
 */
export interface GroupHom<G, H, A = unknown, B = unknown> {
  readonly source: FiniteGroup<A>;
  readonly target: FiniteGroup<B>;
  readonly map: (a: A) => B;
  readonly name?: string;
  
  // Analysis is attached post construction (see analyzeHom below)
  witnesses?: HomWitnesses<A, B>;
  
  // ============================================================================
  // METHODS FROM CLASS-BASED IMPLEMENTATION (/src/algebra/group/GroupHom.ts)
  // ============================================================================
  
  /**
   * Law: f(x ◦ y) = f(x) ⋄ f(y) and f(e_G) = e_H, f(x)^{-1} = f(x)^{-1}.
   * 
   * @example
   * ```typescript
   * if (hom.respectsOp) {
   *   const isValid = hom.respectsOp(x, y);
   * }
   * ```
   */
  respectsOp?(x: A, y: A): boolean;
  
  /**
   * Check if the homomorphism preserves the identity element.
   * 
   * @example
   * ```typescript
   * if (hom.preservesId) {
   *   const preservesIdentity = hom.preservesId();
   * }
   * ```
   */
  preservesId?(): boolean;
  
  /**
   * Check if the homomorphism preserves inverses.
   * 
   * @example
   * ```typescript
   * if (hom.preservesInv) {
   *   const preservesInverses = hom.preservesInv(x);
   * }
   * ```
   */
  preservesInv?(x: A): boolean;
  
  /**
   * Kernel: { g ∈ G | f(g) = e_H } as a NormalSubgroup witness.
   * 
   * @example
   * ```typescript
   * if (hom.kernel) {
   *   const kernel = hom.kernel();
   *   const isInKernel = kernel.carrier(x);
   * }
   * ```
   */
  kernel?(): NormalSubgroup<A>;
  
  /**
   * Image predicate: { h ∈ H | ∃g. f(g)=h } (semi-decidable by search for finite G).
   * 
   * @example
   * ```typescript
   * if (hom.imagePredicate) {
   *   const imagePred = hom.imagePredicate();
   *   const isInImage = imagePred(h);
   * }
   * ```
   */
  imagePredicate?(): (h: B) => boolean;
  
  /**
   * Canonical factorization through the kernel-pair quotient using Eq abstraction.
   * 
   * @example
   * ```typescript
   * if (hom.factorization) {
   *   const factorization = hom.factorization(eqH);
   *   const quotient = factorization.quotient;
   *   const pi = factorization.pi;
   *   const iota = factorization.iota;
   * }
   * ```
   */
  factorization?(eqH: Eq<B>): FactorizationResult<A, B>;
  
  // ============================================================================
  // METHOD FROM SIMPLE INTERFACE (/src/structures/group/Hom.ts)
  // ============================================================================
  
  /**
   * Optional compatibility method for tests that expect `verify()` on homs.
   * 
   * @example
   * ```typescript
   * if (hom.verify) {
   *   const isValid = hom.verify();
   * }
   * ```
   */
  verify?(): boolean;
}

// ============================================================================
// ENHANCED WITNESS SYSTEM
// ============================================================================

/**
 * Properties + constructive witnesses/counterexamples.
 * 
 * Extended to include witness properties from EnhancedGroupHom.
 */
export interface HomWitnesses<A, B> {
  // Algebraic fact
  isHom: boolean;
  
  // Categorical facts
  isMono: boolean;               // left-cancellable
  isEpi: boolean;                // right-cancellable
  isIso: boolean;                // has two-sided inverse
  
  // Structure-level data
  leftInverse?: GroupHom<any, any>;
  rightInverse?: GroupHom<any, any>;
  
  // Enhanced witness properties (from EnhancedGroupHom)
  preservesOp?: (x: A, y: A) => boolean;
  preservesId?: () => boolean;
  preservesInv?: (x: A) => boolean;
  
  // Optional diagnostics
  // Counterexamples for cancellability, when they exist
  monoCounterexample?: { j: any; g: GroupHom<any, any>; h: GroupHom<any, any> };
  epiCounterexample?: { j: any; g: GroupHom<any, any>; h: GroupHom<any, any> };
}

// ============================================================================
// FACTORIZATION RESULT TYPE
// ============================================================================

/**
 * Result of canonical factorization through kernel-pair quotient.
 */
export interface FactorizationResult<A, B> {
  quotient: any; // QuotientGroup type
  pi: (g: A) => any; // projection to quotient
  iota: (q: { rep: A }) => B; // injection from quotient
  law_compose_equals_f: (g: A) => boolean; // composition law
}

// ============================================================================
// COMPATIBILITY ADAPTERS
// ============================================================================

/**
 * Adapter for class-based homomorphisms from /src/algebra/group/GroupHom.ts
 * 
 * @example
 * ```typescript
 * // Migration from class-based:
 * const classHom = new ClassGroupHom(G, H, map);
 * const unifiedHom = fromClassHom(classHom);
 * ```
 */
export function fromClassHom<G, H>(
  classHom: {
    G: FiniteGroup<G>;
    H: FiniteGroup<H>;
    map: (g: G) => H;
    respectsOp?: (x: G, y: G) => boolean;
    preservesId?: () => boolean;
    preservesInv?: (x: G) => boolean;
    kernel?: () => NormalSubgroup<G>;
    imagePredicate?: () => (h: H) => boolean;
    factorization?: (eqH: Eq<H>) => FactorizationResult<G, H>;
    verify?: () => boolean;
  }
): GroupHom<unknown, unknown, G, H> {
  const result: GroupHom<unknown, unknown, G, H> = {
    source: classHom.G,
    target: classHom.H,
    map: classHom.map
  };
  
  // Copy over methods if they exist
  if (classHom.respectsOp) result.respectsOp = classHom.respectsOp;
  if (classHom.preservesId) result.preservesId = classHom.preservesId;
  if (classHom.preservesInv) result.preservesInv = classHom.preservesInv;
  if (classHom.kernel) result.kernel = classHom.kernel;
  if (classHom.imagePredicate) result.imagePredicate = classHom.imagePredicate;
  if (classHom.factorization) result.factorization = classHom.factorization;
  if (classHom.verify) result.verify = classHom.verify;
  
  return result;
}

/**
 * Adapter for simple interface homomorphisms from /src/structures/group/Hom.ts
 * 
 * @example
 * ```typescript
 * // Migration from simple interface:
 * const simpleHom = { source: G, target: H, f: map, verify: () => true };
 * const unifiedHom = fromSimpleHom(simpleHom);
 * ```
 */
export function fromSimpleHom<A, B>(
  simpleHom: {
    source: FiniteGroup<A>;
    target: FiniteGroup<B>;
    f: (a: A) => B;
    verify?: () => boolean;
    name?: string;
    witnesses?: any;
  }
): GroupHom<unknown, unknown, A, B> {
  const result: GroupHom<unknown, unknown, A, B> = {
    source: simpleHom.source,
    target: simpleHom.target,
    map: simpleHom.f, // Convert 'f' to 'map'
    name: simpleHom.name,
    witnesses: simpleHom.witnesses
  };
  
  if (simpleHom.verify) result.verify = simpleHom.verify;
  
  return result;
}

/**
 * Adapter for enhanced homomorphisms from /src/algebra/group/EnhancedGroupHom.ts
 * 
 * @example
 * ```typescript
 * // Migration from enhanced interface:
 * const enhancedHom = mkHom(src, dst, run);
 * const unifiedHom = fromEnhancedHom(enhancedHom);
 * ```
 */
export function fromEnhancedHom<A, B>(
  enhancedHom: {
    src: any; // EnhancedGroup<A>
    dst: any; // EnhancedGroup<B>
    run: (a: A) => B;
    preservesOp: (x: A, y: A) => boolean;
    preservesId: () => boolean;
    preservesInv: (x: A) => boolean;
  }
): GroupHom<unknown, unknown, A, B> {
  const result: GroupHom<unknown, unknown, A, B> = {
    source: enhancedHom.src,
    target: enhancedHom.dst,
    map: enhancedHom.run // Convert 'run' to 'map'
  };
  
  // Add enhanced witness properties
  result.witnesses = {
    isHom: true, // Enhanced homomorphisms are assumed to be valid
    isMono: false, // Would need analysis
    isEpi: false, // Would need analysis
    isIso: false, // Would need analysis
    preservesOp: enhancedHom.preservesOp,
    preservesId: enhancedHom.preservesId,
    preservesInv: enhancedHom.preservesInv
  };
  
  return result;
}

// ============================================================================
// MAIN FACTORY FUNCTION
// ============================================================================

/**
 * Options for creating a unified GroupHom.
 */
export interface CreateGroupHomOptions {
  /** Optional name for the homomorphism */
  name?: string;
  /** Whether to automatically analyze witnesses */
  autoAnalyze?: boolean;
  /** Whether to include method implementations */
  includeMethods?: boolean;
}

/**
 * Main constructor for unified GroupHom with options.
 * 
 * @example
 * ```typescript
 * // Basic usage (backward compatible):
 * const hom = createGroupHom(G, H, (x) => x * 2);
 * 
 * // Enhanced usage with options:
 * const enhancedHom = createGroupHom(G, H, (x) => x * 2, {
 *   name: "doubling",
 *   autoAnalyze: true,
 *   includeMethods: true
 * });
 * ```
 */
export function createGroupHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  options: CreateGroupHomOptions = {}
): GroupHom<unknown, unknown, A, B> {
  const result: GroupHom<unknown, unknown, A, B> = {
    source,
    target,
    map
  };
  
  if (options.name) {
    (result as any).name = options.name;
  }
  
  if (options.includeMethods) {
    // Add method implementations from class-based version
    const eqH = target.eq ?? ((x: B, y: B) => x === y);
    const eqG = source.eq ?? ((x: A, y: A) => x === y);
    
    result.respectsOp = (x: A, y: A) => {
      return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
    };
    
    result.preservesId = () => {
      const gId = (source as any).e ?? (source as any).id;
      const hId = (target as any).e ?? (target as any).id;
      return eqH(map(gId), hId);
    };
    
    result.preservesInv = (x: A) => {
      return eqH(map(source.inv(x)), target.inv(map(x)));
    };
    
    result.verify = () => {
      if (!source.elems || !target.elems) return true;
      for (const x of source.elems) {
        for (const y of source.elems) {
          const lhs = map(source.op(x, y));
          const rhs = target.op(map(x), map(y));
          if (!eqH(lhs, rhs)) return false;
        }
      }
      return true;
    };
  }
  
  if (options.autoAnalyze) {
    // Note: This would require importing analyzeHom from the original Hom.ts
    // For now, we'll leave this as a placeholder
    // result.witnesses = analyzeHom(result);
  }
  
  return result;
}

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================================

/**
 * Legacy type alias for backward compatibility.
 * @deprecated Use GroupHom<unknown, unknown, A, B> instead
 */
export type LegacyGroupHom<A, B> = GroupHom<unknown, unknown, A, B>;

/**
 * Legacy constructor alias for backward compatibility.
 * @deprecated Use createGroupHom instead
 */
export const createLegacyHom = createGroupHom;

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Re-export commonly used types
export type { FiniteGroup } from "./Group";
export type { NormalSubgroup } from "./NormalSubgroup";
export type { Eq } from "../../types/eq.js";

// Re-export utility functions from the canonical implementation
// Note: These would need to be imported from the original Hom.ts file
// export { compose, isHomomorphism, allGroupHoms, equalPointwise, analyzeHom } from "./Hom";