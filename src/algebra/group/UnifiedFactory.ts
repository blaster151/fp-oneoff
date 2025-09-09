/**
 * Unified Factory Functions and Constructors for GroupHom
 * 
 * This module consolidates all creation patterns from:
 * 1. /src/algebra/group/Hom.ts - hom() function and compose() utility
 * 2. /src/algebra/group/GroupHom.ts - new GroupHom() constructor
 * 3. /src/structures/group/Hom.ts - simple interface pattern
 * 4. /src/algebra/group/EnhancedGroupHom.ts - mkHom(), idHom(), composeHom()
 * 
 * Provides unified creation patterns while maintaining all existing functionality.
 */

import type { UnifiedGroupHom } from './UnifiedGroupHom';
import type { FiniteGroup } from './Group';
import type { EnhancedGroup } from './EnhancedGroup';
import { analyzeBasic } from './UnifiedAnalysis';

// ============================================================================
// TYPE DEFINITIONS
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
  /** Whether to include enhanced witness properties */
  includeEnhancedWitnesses?: boolean;
  /** Custom verification function */
  verify?: () => boolean;
}

/**
 * Legacy options for backward compatibility.
 */
export interface LegacyCreateOptions {
  name?: string;
  verify?: () => boolean;
}

// ============================================================================
// MAIN FACTORY FUNCTION (Enhanced)
// ============================================================================

/**
 * Main constructor for unified GroupHom with comprehensive options.
 * 
 * Handles all creation patterns from the four competing implementations.
 * 
 * @param source - Source group
 * @param target - Target group  
 * @param map - Homomorphism function
 * @param options - Creation options
 * @returns Unified GroupHom
 * 
 * @example
 * ```typescript
 * // Basic usage (backward compatible with hom() from Hom.ts)
 * const hom = createGroupHom(G, H, (x) => x * 2);
 * 
 * // With options (like class-based with methods)
 * const enhanced = createGroupHom(G, H, (x) => x * 2, {
 *   name: "doubling",
 *   autoAnalyze: true,
 *   includeMethods: true
 * });
 * 
 * // Simple interface pattern
 * const simple = createGroupHom(G, H, (x) => x * 2, {
 *   verify: () => true
 * });
 * ```
 */
export function createGroupHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  options: CreateGroupHomOptions = {}
): UnifiedGroupHom<unknown, unknown, A, B> {
  try {
    // Validate inputs
    if (!source || !target || typeof map !== 'function') {
      throw new Error('Invalid arguments: source, target, and map are required');
    }

    // Create base homomorphism
    const result: UnifiedGroupHom<unknown, unknown, A, B> = {
      source,
      target,
      map
    };

    // Add name if provided
    if (options.name) {
      result.name = options.name;
    }

    // Add methods if requested (from class-based implementation)
    if (options.includeMethods) {
      addClassBasedMethods(result);
    }

    // Add enhanced witness properties if requested
    if (options.includeEnhancedWitnesses) {
      addEnhancedWitnesses(result);
    }

    // Add custom verify function if provided (from simple interface)
    if (options.verify) {
      result.verify = options.verify;
    } else if (options.includeMethods) {
      // Add default verify function
      result.verify = () => quickVerify(result);
    }

    // Auto-analyze if requested
    if (options.autoAnalyze) {
      return analyzeBasic(result);
    }

    return result;

  } catch (error) {
    throw new Error(`Failed to create GroupHom: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// PATTERN-SPECIFIC FACTORY FUNCTIONS
// ============================================================================

/**
 * Factory for Hom.ts pattern: hom(source, target, map, name?)
 * 
 * @example
 * ```typescript
 * // Before: hom(G, H, map, "doubling")
 * // After: hom(G, H, map, "doubling")
 * const h = hom(G, H, (x) => x * 2, "doubling");
 * ```
 */
export function hom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  name?: string
): UnifiedGroupHom<unknown, unknown, A, B> {
  return createGroupHom(source, target, map, {
    name,
    autoAnalyze: true // Maintain original behavior
  });
}

/**
 * Factory for class-based pattern: new GroupHom(G, H, map)
 * 
 * @example
 * ```typescript
 * // Before: new GroupHom(G, H, map)
 * // After: createClassHom(G, H, map)
 * const h = createClassHom(G, H, (x) => x * 2);
 * ```
 */
export function createClassHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B
): UnifiedGroupHom<unknown, unknown, A, B> {
  return createGroupHom(source, target, map, {
    includeMethods: true,
    includeEnhancedWitnesses: true
  });
}

/**
 * Factory for simple interface pattern: { source, target, f, verify? }
 * 
 * @example
 * ```typescript
 * // Before: { source: G, target: H, f: map, verify: () => true }
 * // After: createSimpleHom(G, H, map, { verify: () => true })
 * const h = createSimpleHom(G, H, (x) => x * 2, { verify: () => true });
 * ```
 */
export function createSimpleHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  options: LegacyCreateOptions = {}
): UnifiedGroupHom<unknown, unknown, A, B> {
  return createGroupHom(source, target, map, {
    name: options.name,
    verify: options.verify,
    includeMethods: true // Simple interface includes verify method
  });
}

/**
 * Factory for enhanced pattern: mkHom(src, dst, run)
 * 
 * @example
 * ```typescript
 * // Before: mkHom(src, dst, run)
 * // After: createEnhancedHom(src, dst, run)
 * const h = createEnhancedHom(src, dst, (x) => x * 2);
 * ```
 */
export function createEnhancedHom<A, B>(
  src: EnhancedGroup<A>,
  dst: EnhancedGroup<B>,
  run: (a: A) => B
): UnifiedGroupHom<unknown, unknown, A, B> {
  return createGroupHom(src, dst, run, {
    includeEnhancedWitnesses: true,
    includeMethods: true
  });
}

// ============================================================================
// UTILITY FUNCTIONS (Preserved from original implementations)
// ============================================================================

/**
 * Compose homomorphisms (unchecked).
 * CRITICAL: Used in 60+ files - must work perfectly with all migrated homomorphisms.
 * 
 * From /src/algebra/group/Hom.ts
 * 
 * @example
 * ```typescript
 * const composed = compose(g, f);
 * // Works with all creation patterns without changes to calling code
 * ```
 */
export function compose<A, B, C>(
  g: UnifiedGroupHom<unknown, unknown, B, C>,
  f: UnifiedGroupHom<unknown, unknown, A, B>
): UnifiedGroupHom<unknown, unknown, A, C> {
  try {
    return {
      source: f.source,
      target: g.target,
      map: (a: A) => g.map(f.map(a)),
      name: (g as any).label ? ((f as any).label ? `${(g as any).label} ∘ ${(f as any).label}` : `${(g as any).label}∘f`) : ((f as any).label ? `g∘${(f as any).label}` : 'g∘f')
    };
  } catch (error) {
    throw new Error(`Composition failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check the homomorphism law f(a*b)=f(a)*f(b) by brute force.
 * From /src/algebra/group/Hom.ts
 */
export function isHomomorphism<A, B>(f: UnifiedGroupHom<unknown, unknown, A, B>): boolean {
  try {
    const G = f.source, H = f.target;
    const eqH = H.eq ?? ((x: B, y: B) => x === y);
    
    for (const a of G.elems) {
      for (const b of G.elems) {
        const lhs = f.map(G.op(a, b));
        const rhs = H.op(f.map(a), f.map(b));
        if (!eqH(lhs, rhs)) return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('isHomomorphism check failed:', error);
    return false;
  }
}

/**
 * Pointwise equality of maps on a finite domain.
 * From /src/algebra/group/Hom.ts
 */
export function equalPointwise<X, Y>(
  Dom: ReadonlyArray<X>,
  eqY: (y1: Y, y2: Y) => boolean,
  f: (x: X) => Y,
  g: (x: X) => Y
): boolean {
  try {
    for (const x of Dom) {
      if (!eqY(f(x), g(x))) return false;
    }
    return true;
  } catch (error) {
    console.warn('equalPointwise check failed:', error);
    return false;
  }
}

/**
 * Build all functions Dom -> Codom (finite) using a provided array of codomain values.
 * From /src/algebra/group/Hom.ts
 */
function allFunctions<X, Y>(Dom: ReadonlyArray<X>, Cod: ReadonlyArray<Y>): Array<(x: X) => Y> {
  const n = Dom.length, m = Cod.length;
  if (n === 0) return [(_x: X) => {
    const c0 = Cod[0];
    if (c0 === undefined) throw new Error("Empty codomain");
    return c0;
  }];
  
  const out: Array<(x: X) => Y> = [];
  const idx: number[] = Array(n).fill(0);
  const total = m ** n;
  
  for (let k = 0; k < total; k++) {
    const table = idx.map(i => {
      const c = Cod[i];
      if (c === undefined) throw new Error(`Codomain index ${i} out of bounds`);
      return c;
    });
    
    const f = (x: X) => {
      for (let i = 0; i < Dom.length; i++) {
        if (JSON.stringify(Dom[i]) === JSON.stringify(x)) {
          const result = table[i];
          if (result === undefined) throw new Error(`No value at index ${i}`);
          return result;
        }
      }
      throw new Error(`Element ${JSON.stringify(x)} not found in domain`);
    };
    
    out.push(f);
    
    // increment idx in base m
    for (let i = 0; i < n; i++) {
      const current = idx[i];
      if (current !== undefined) {
        idx[i] = current + 1;
        if (idx[i]! < m) break;
        idx[i] = 0;
      }
    }
  }
  return out;
}

/**
 * Enumerate all group homs J->G by filtering all functions that preserve op.
 * From /src/algebra/group/Hom.ts
 */
export function allGroupHoms<J, A>(
  J: FiniteGroup<J>,
  G: FiniteGroup<A>
): Array<UnifiedGroupHom<unknown, unknown, J, A>> {
  try {
    const eqG = G.eq ?? ((x: A, y: A) => x === y);
    const fs = allFunctions(J.elems, G.elems);
    const homs: Array<UnifiedGroupHom<unknown, unknown, J, A>> = [];
    
    for (const f of fs) {
      const cand: UnifiedGroupHom<unknown, unknown, J, A> = { source: J, target: G, map: f };
      if (isHomomorphism(cand)) homs.push(cand);
    }
    
    // de-duplicate identical tables
    const result = homs.filter((h, i) =>
      homs.findIndex(k => equalPointwise(J.elems, eqG, h.map, k.map)) === i);
    return result;
  } catch (error) {
    console.warn('allGroupHoms failed:', error);
    return [];
  }
}

// ============================================================================
// ENHANCED UTILITY FUNCTIONS (from EnhancedGroupHom.ts)
// ============================================================================

/**
 * Create identity homomorphism.
 * From /src/algebra/group/EnhancedGroupHom.ts
 * 
 * @example
 * ```typescript
 * const id = idHom(G);
 * ```
 */
export function idHom<A>(G: FiniteGroup<A>): UnifiedGroupHom<unknown, unknown, A, A> {
  return createGroupHom(G, G, (x) => x, {
    name: `id_${(G as any).name ?? 'G'}`,
    includeMethods: true,
    includeEnhancedWitnesses: true
  });
}

/**
 * Compose homomorphisms with enhanced interface compatibility.
 * From /src/algebra/group/EnhancedGroupHom.ts
 * 
 * @example
 * ```typescript
 * const composed = composeHom(g, f);
 * ```
 */
export function composeHom<A, B, C>(
  g: UnifiedGroupHom<unknown, unknown, B, C>,
  f: UnifiedGroupHom<unknown, unknown, A, B>
): UnifiedGroupHom<unknown, unknown, A, C> {
  try {
    if (f.target !== g.source) {
      console.warn("composeHom: incompatible sources/targets");
    }
    
    const run = (a: A) => g.map(f.map(a));
    return createGroupHom(f.source, g.target, run, {
      name: `${(g as any).name ?? 'g'} ∘ ${(f as any).name ?? 'f'}`,
      includeMethods: true,
      includeEnhancedWitnesses: true
    });
  } catch (error) {
    throw new Error(`Enhanced composition failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick verification function for simple interface compatibility.
 */
function quickVerify<A, B>(hom: UnifiedGroupHom<unknown, unknown, A, B>): boolean {
  try {
    const { source, target, map } = hom;
    
    if (!source.elems || !target.elems) return true;
    
    const eq = target.eq ?? ((x: B, y: B) => x === y);
    
    for (const x of source.elems) {
      for (const y of source.elems) {
        const lhs = map(source.op(x, y));
        const rhs = target.op(map(x), map(y));
        if (!eq(lhs, rhs)) return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Quick verification failed:', error);
    return false;
  }
}

/**
 * Add class-based methods to a homomorphism.
 */
function addClassBasedMethods<A, B>(hom: UnifiedGroupHom<unknown, unknown, A, B>): void {
  const { source, target, map } = hom;
  const eqH = target.eq ?? ((x: B, y: B) => x === y);
  
  hom.respectsOp = (x: A, y: A) => {
    try {
      return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
    } catch {
      return false;
    }
  };
  
  hom.preservesId = () => {
    try {
      const gId = (source as any).e ?? (source as any).id;
      const hId = (target as any).e ?? (target as any).id;
      return eqH(map(gId), hId);
    } catch {
      return false;
    }
  };
  
  hom.preservesInv = (x: A) => {
    try {
      return eqH(map(source.inv(x)), target.inv(map(x)));
    } catch {
      return false;
    }
  };
  
  // Add other class-based methods as needed
  hom.kernel = () => {
    try {
      const carrier = (g: A) => eqH(map(g), (target as any).e ?? (target as any).id);
      const include = (g: A) => g;
      return { carrier, include, conjClosed: () => true } as any;
    } catch (error) {
      throw new Error(`Kernel computation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  hom.imagePredicate = () => {
    return (h: B) => {
      if (source.elems) {
        for (const g of source.elems) {
          if (eqH(map(g), h)) return true;
        }
      }
      return false;
    };
  };
}

/**
 * Add enhanced witness properties to a homomorphism.
 */
function addEnhancedWitnesses<A, B>(hom: UnifiedGroupHom<unknown, unknown, A, B>): void {
  const { source, target, map } = hom;
  const eqH = target.eq ?? ((x: B, y: B) => x === y);
  
  if (!hom.witnesses) {
    hom.witnesses = { isHom: true, isMono: false, isEpi: false, isIso: false };
  }
  
  hom.witnesses.preservesOp = (x: A, y: A) => {
    try {
      return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
    } catch {
      return false;
    }
  };
  
  hom.witnesses.preservesId = () => {
    try {
      const gId = (source as any).e ?? (source as any).id;
      const hId = (target as any).e ?? (target as any).id;
      return eqH(map(gId), hId);
    } catch {
      return false;
    }
  };
  
  hom.witnesses.preservesInv = (x: A) => {
    try {
      return eqH(map(source.inv(x)), target.inv(map(x)));
    } catch {
      return false;
    }
  };
}

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================================

/**
 * Legacy constructor alias for backward compatibility.
 * @deprecated Use createGroupHom instead
 */
export const createLegacyHom = createGroupHom;

/**
 * Legacy hom function alias.
 * @deprecated Use hom instead
 */
export const createHom = hom;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Main factory
  createGroupHom,
  
  // Pattern-specific factories
  hom,
  createClassHom,
  createSimpleHom,
  createEnhancedHom,
  
  // Utility functions (CRITICAL - used in 60+ files)
  compose,
  isHomomorphism,
  equalPointwise,
  allGroupHoms,
  
  // Enhanced utilities
  idHom,
  composeHom,
  
  // Legacy aliases
  createLegacyHom,
  createHom
};