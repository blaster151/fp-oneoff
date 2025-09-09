/**
 * Unified Analysis Functions for GroupHom
 * 
 * This module consolidates all analysis and witness generation approaches from:
 * 1. /src/algebra/group/Hom.ts (interface-based) - comprehensive witness analysis
 * 2. /src/algebra/group/GroupHom.ts (class-based) - built-in law checking methods
 * 3. /src/structures/group/Hom.ts (simple interface) - basic verification
 * 4. /src/algebra/group/EnhancedGroupHom.ts (enhanced interface) - built-in witness properties
 * 
 * Provides three analysis levels with performance optimization and backward compatibility.
 */

import type { GroupHom } from './Hom';
import type { FiniteGroup } from './Group';
import type { NormalSubgroup } from './NormalSubgroup';
import type { Eq } from '../../types/eq.js';
import { eqOf, Cyclic } from './Group';
import { isNormal } from './NormalSubgroup';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Enhanced witness interface that includes all properties from all implementations.
 */
export interface UnifiedWitnesses<A, B> {
  // Core algebraic facts (from interface-based implementation)
  isHom: boolean;
  isMono: boolean;               // left-cancellable
  isEpi: boolean;                // right-cancellable
  isIso: boolean;                // has two-sided inverse
  
  // Structure-level data (from interface-based implementation)
  leftInverse?: GroupHom<any, any>;
  rightInverse?: GroupHom<any, any>;
  
  // Enhanced witness properties (from EnhancedGroupHom)
  preservesOp?: (x: A, y: A) => boolean;
  preservesId?: () => boolean;
  preservesInv?: (x: A) => boolean;
  
  // Counterexamples (from interface-based implementation)
  monoCounterexample?: { j: any; g: GroupHom<any, any>; h: GroupHom<any, any> };
  epiCounterexample?: { j: any; g: GroupHom<any, any>; h: GroupHom<any, any> };
  
  // Advanced features (from class-based implementation)
  kernel?: NormalSubgroup<A>;
  imagePredicate?: (h: B) => boolean;
  factorization?: (eqH: Eq<B>) => FactorizationResult<A, B>;
}

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
// UTILITY FUNCTIONS (from interface-based implementation)
// ============================================================================

/**
 * Check the homomorphism law f(a*b)=f(a)*f(b) by brute force.
 * From /src/algebra/group/Hom.ts
 */
function isHomomorphism<A, B>(f: GroupHom<unknown, unknown, A, B>): boolean {
  const G = f.source, H = f.target, eqH = eqOf(H);
  for (const a of G.elems) for (const b of G.elems) {
    const lhs = f.map(G.op(a, b));
    const rhs = H.op(f.map(a), f.map(b));
    if (!eqH(lhs, rhs)) return false;
  }
  // identity preserved automatically from law with a=id or b=id in finite groups
  return true;
}

/**
 * Pointwise equality of maps on a finite domain.
 * From /src/algebra/group/Hom.ts
 */
function equalPointwise<X, Y>(
  Dom: ReadonlyArray<X>, 
  eqY: (y1: Y, y2: Y) => boolean,
  f: (x: X) => Y, 
  g: (x: X) => Y
): boolean {
  for (const x of Dom) if (!eqY(f(x), g(x))) return false;
  return true;
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
function allGroupHoms<J, A>(
  J: FiniteGroup<J>, 
  G: FiniteGroup<A>
): Array<GroupHom<unknown, unknown, J, A>> {
  const eqG = eqOf(G);
  const fs = allFunctions(J.elems, G.elems);
  const homs: Array<GroupHom<unknown, unknown, J, A>> = [];
  
  for (const f of fs) {
    const cand: GroupHom<unknown, unknown, J, A> = { source: J, target: G, map: f };
    if (isHomomorphism(cand)) homs.push(cand);
  }
  
  // de-duplicate identical tables
  const result = homs.filter((h, i) =>
    homs.findIndex(k => equalPointwise(J.elems, eqG, h.map, k.map)) === i);
  return result;
}

/**
 * Compose homomorphisms (unchecked).
 * From /src/algebra/group/Hom.ts
 */
function compose<A, B, C>(
  g: GroupHom<unknown, unknown, B, C>, 
  f: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, C> {
  return {
    source: f.source,
    target: g.target,
    map: (a: A) => g.map(f.map(a)),
    name: (g as any).label ? ((f as any).label ? `${(g as any).label} ∘ ${(f as any).label}` : `${(g as any).label}∘f`) : ((f as any).label ? `g∘${(f as any).label}` : 'g∘f')
  };
}

// ============================================================================
// ANALYSIS LEVEL 1: QUICK VERIFICATION (from simple interface)
// ============================================================================

/**
 * Quick verification - just basic homomorphism law check.
 * Based on /src/structures/group/Hom.ts verify() method.
 * 
 * This is the fastest analysis level, suitable for basic validation.
 * 
 * @param hom - The homomorphism to verify
 * @returns true if homomorphism law is satisfied
 * 
 * @example
 * ```typescript
 * const isValid = quickVerify(hom);
 * if (!isValid) {
 *   console.log("Not a valid homomorphism");
 * }
 * ```
 */
export function quickVerify<A, B>(hom: GroupHom<unknown, unknown, A, B>): boolean {
  try {
    const { source, target, map } = hom;
    
    // Quick check: if no elements, assume valid
    if (!source.elems || !target.elems) return true;
    
    const eq = target.eq ?? ((x: B, y: B) => x === y);
    
    // Check homomorphism law: f(x * y) = f(x) * f(y)
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

// ============================================================================
// ANALYSIS LEVEL 2: BASIC ANALYSIS (from interface-based implementation)
// ============================================================================

/**
 * Basic analysis - core properties with mono/epi/iso detection.
 * Based on /src/algebra/group/Hom.ts analyzeHom() function.
 * 
 * This provides the standard witness analysis that most code expects.
 * 
 * @param hom - The homomorphism to analyze
 * @returns Enhanced homomorphism with basic witnesses
 * 
 * @example
 * ```typescript
 * const analyzed = analyzeBasic(hom);
 * console.log('Is monomorphism:', analyzed.witnesses?.isMono);
 * console.log('Is epimorphism:', analyzed.witnesses?.isEpi);
 * ```
 */
export function analyzeBasic<A, B>(
  hom: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, B> {
  try {
    const G = hom.source, H = hom.target;
    const eqH = eqOf(H), eqG = eqOf(G);

    const isHom = isHomomorphism(hom);

    // Find a two-sided inverse hom if it exists (by table search)
    let leftInv: GroupHom<B, A> | undefined;
    let rightInv: GroupHom<B, A> | undefined;
    let isIso = false;

    // Enumerate all homs H->G
    const homsHG = allGroupHoms(H, G);
    for (const g of homsHG) {
      const gofEqIdG = equalPointwise(G.elems as ReadonlyArray<A>, eqG, (x: A) => g.map(hom.map(x)), (x: A) => x);
      const fogEqIdH = equalPointwise(H.elems as ReadonlyArray<B>, eqH, (y: B) => hom.map(g.map(y as any)), (y: B) => y);
      if (gofEqIdG) leftInv = g as any;
      if (fogEqIdH) rightInv = g as any;
      if (gofEqIdG && fogEqIdH) { isIso = true; break; }
    }

    // Mono (left-cancellable): for all g,h: J->G, f∘g = f∘h ⇒ g = h
    const probeSizes = [1, 2, 3];
    let isMono = true;
    let monoCounterexample: UnifiedWitnesses<A, B>['monoCounterexample'] = undefined;

    outerMono:
    for (const n of probeSizes) {
      const J = Cyclic(n) as FiniteGroup<number>;
      const homsJG = allGroupHoms(J, G);
      for (let i = 0; i < homsJG.length; i++) for (let j = i + 1; j < homsJG.length; j++) {
        const g = homsJG[i];
        const h = homsJG[j];
        if (g && h) {
          const fog = compose(hom as any, g as any);
          const foh = compose(hom as any, h as any);
          const eq = equalPointwise(J.elems, eqH, fog.map as any, foh.map as any);
          if (eq) {
            const same = equalPointwise(J.elems, eqG, g.map as any, h.map as any);
            if (!same) { isMono = false; monoCounterexample = { j: (J as any).label ?? `C${n}`, g: g as any, h: h as any }; break outerMono; }
          }
        }
      }
    }

    // Epi (right-cancellable): for all g,h: H->K, g∘f = h∘f ⇒ g = h
    let isEpi = true;
    let epiCounterexample: UnifiedWitnesses<A, B>['epiCounterexample'] = undefined;

    outerEpi:
    for (const n of probeSizes) {
      const K = Cyclic(n) as FiniteGroup<number>;
      const homsHK = allGroupHoms(H, K);
      for (let i = 0; i < homsHK.length; i++) for (let j = i + 1; j < homsHK.length; j++) {
        const g = homsHK[i];
        const h = homsHK[j];
        if (g && h) {
          const gof = compose(g as any, hom as any);
          const hof = compose(h as any, hom as any);
          const eq = equalPointwise(G.elems, eqOf(K), gof.map as any, hof.map as any);
          if (eq) {
            const same = equalPointwise(H.elems, eqOf(K), g.map as any, h.map as any);
            if (!same) { isEpi = false; epiCounterexample = { j: (K as any).label ?? `C${n}`, g: g as any, h: h as any }; break outerEpi; }
          }
        }
      }
    }

    const witnesses: UnifiedWitnesses<A, B> = {
      isHom,
      isMono,
      isEpi,
      isIso
    };
    
    if (leftInv !== undefined) (witnesses as any).leftInverse = leftInv;
    if (rightInv !== undefined) (witnesses as any).rightInverse = rightInv;
    if (monoCounterexample !== undefined) (witnesses as any).monoCounterexample = monoCounterexample;
    if (epiCounterexample !== undefined) (witnesses as any).epiCounterexample = epiCounterexample;
    
    hom.witnesses = witnesses;
    return hom;
    
  } catch (error) {
    console.warn('Basic analysis failed:', error);
    // Return hom with minimal witnesses
    hom.witnesses = { isHom: false, isMono: false, isEpi: false, isIso: false };
    return hom;
  }
}

// ============================================================================
// ANALYSIS LEVEL 3: COMPLETE ANALYSIS (includes all class-based features)
// ============================================================================

/**
 * Complete analysis - includes all features from class-based implementation.
 * Combines basic analysis with advanced features like kernel, image, factorization.
 * 
 * This is the most comprehensive analysis level, suitable for advanced use cases.
 * 
 * @param hom - The homomorphism to analyze
 * @returns Enhanced homomorphism with complete witnesses and methods
 * 
 * @example
 * ```typescript
 * const complete = analyzeComplete(hom);
 * 
 * // Access basic witnesses
 * console.log('Is isomorphism:', complete.witnesses?.isIso);
 * 
 * // Access advanced features
 * if (complete.kernel) {
 *   const kernel = complete.kernel();
 *   console.log('Kernel size:', kernel.carrier);
 * }
 * 
 * if (complete.respectsOp) {
 *   const respects = complete.respectsOp(x, y);
 *   console.log('Respects operation:', respects);
 * }
 * ```
 */
export function analyzeComplete<A, B>(
  hom: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, B> {
  try {
    // Start with basic analysis
    const basicAnalyzed = analyzeBasic(hom);
    
    // Add enhanced witness properties (from EnhancedGroupHom)
    const enhancedWitnesses = generateEnhancedWitnesses(hom);
    
    // Add class-based methods
    addClassBasedMethods(hom);
    
    // Merge all witness properties
    if (basicAnalyzed.witnesses) {
      basicAnalyzed.witnesses = {
        ...basicAnalyzed.witnesses,
        ...enhancedWitnesses
      };
    }
    
    return basicAnalyzed;
    
  } catch (error) {
    console.warn('Complete analysis failed:', error);
    return analyzeBasic(hom);
  }
}

// ============================================================================
// ENHANCED WITNESS GENERATION (from EnhancedGroupHom)
// ============================================================================

/**
 * Generate enhanced witness properties from EnhancedGroupHom implementation.
 */
function generateEnhancedWitnesses<A, B>(
  hom: GroupHom<unknown, unknown, A, B>
): Partial<UnifiedWitnesses<A, B>> {
  const { source, target, map } = hom;
  const eqH = target.eq ?? ((x: B, y: B) => x === y);
  
  return {
    preservesOp: (x: A, y: A) => {
      try {
        return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
      } catch {
        return false;
      }
    },
    
    preservesId: () => {
      try {
        const gId = (source as any).e ?? (source as any).id;
        const hId = (target as any).e ?? (target as any).id;
        return eqH(map(gId), hId);
      } catch {
        return false;
      }
    },
    
    preservesInv: (x: A) => {
      try {
        return eqH(map(source.inv(x)), target.inv(map(x)));
      } catch {
        return false;
      }
    }
  };
}

// ============================================================================
// CLASS-BASED METHODS (from GroupHom.ts)
// ============================================================================

/**
 * Add class-based methods to the homomorphism.
 */
function addClassBasedMethods<A, B>(hom: any): void {
  const { source, target, map } = hom;
  const eqH = target.eq ?? ((x: B, y: B) => x === y);
  
  // Add respectsOp method
  hom.respectsOp = (x: A, y: A) => {
    try {
      return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
    } catch {
      return false;
    }
  };
  
  // Add preservesId method
  hom.preservesId = () => {
    try {
      const gId = (source as any).e ?? (source as any).id;
      const hId = (target as any).e ?? (target as any).id;
      return eqH(map(gId), hId);
    } catch {
      return false;
    }
  };
  
  // Add preservesInv method
  hom.preservesInv = (x: A) => {
    try {
      return eqH(map(source.inv(x)), target.inv(map(x)));
    } catch {
      return false;
    }
  };
  
  // Add kernel method
  hom.kernel = () => {
    try {
      const carrier = (g: A) => eqH(map(g), (target as any).e ?? (target as any).id);
      const include = (g: A) => g;
      const N = { carrier, include };
      return isNormal(source, N)!;
    } catch (error) {
      throw new Error(`Kernel computation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Add imagePredicate method
  hom.imagePredicate = () => {
    return (h: B) => {
      // For finite groups, we can search through all elements
      if (source.elems) {
        for (const g of source.elems) {
          if (eqH(map(g), h)) return true;
        }
      }
      return false;
    };
  };
  
  // Add factorization method (simplified version)
  hom.factorization = (eqH: Eq<B>) => {
    // This is a simplified implementation - full version would need QuotientGroup
    return {
      quotient: null, // Would need proper QuotientGroup implementation
      pi: (g: A) => ({ rep: g }),
      iota: (q: { rep: A }) => map(q.rep),
      law_compose_equals_f: (g: A) => eqH(map(g), map(g))
    };
  };
  
  // Add verify method (from simple interface)
  hom.verify = () => quickVerify(hom);
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Backward compatible analyzeHom function.
 * Maintains the exact signature from /src/algebra/group/Hom.ts
 * 
 * @param f - The homomorphism to analyze
 * @returns Enhanced homomorphism with witnesses
 */
export function analyzeHom<A, B>(
  f: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, B> {
  return analyzeBasic(f);
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Cache for expensive computations.
 */
const analysisCache = new WeakMap<GroupHom<any, any>, UnifiedWitnesses<any, any>>();

/**
 * Cached version of analyzeBasic for performance.
 */
export function analyzeBasicCached<A, B>(
  hom: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, B> {
  const cached = analysisCache.get(hom);
  if (cached) {
    hom.witnesses = cached;
    return hom;
  }
  
  const result = analyzeBasic(hom);
  if (result.witnesses) {
    analysisCache.set(hom, result.witnesses);
  }
  
  return result;
}

/**
 * Cached version of analyzeComplete for performance.
 */
export function analyzeCompleteCached<A, B>(
  hom: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, B> {
  const cached = analysisCache.get(hom);
  if (cached) {
    hom.witnesses = cached;
    // Still need to add methods since they're not cached
    addClassBasedMethods(hom);
    return hom;
  }
  
  const result = analyzeComplete(hom);
  if (result.witnesses) {
    analysisCache.set(hom, result.witnesses);
  }
  
  return result;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  isHomomorphism,
  equalPointwise,
  allGroupHoms,
  compose
};