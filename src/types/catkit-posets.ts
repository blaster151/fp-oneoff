// catkit-posets.ts
// Posets as thin categories: P ≤ Q becomes a category with at most one morphism x → y
// This provides a bridge between order theory and category theory:
// - Monotone maps become functors
// - Galois connections become adjunctions
// - Meets/joins become limits/colimits
// - Closure/interior operators become monads/comonads

import { Category, Functor } from './catkit-comma-categories.js';

// ------------------------------------------------------------
// Poset structure and thin categories
// ------------------------------------------------------------

/** A partially ordered set with explicit element list and order relation */
export interface Poset<T> {
  readonly elems: ReadonlyArray<T>;
  leq: (x: T, y: T) => boolean; // reflexive & transitive assumed
}

/** Morphism in a thin category: either exists (x ≤ y) or doesn't */
export type ThinMor<T> = {
  readonly src: T;
  readonly dst: T;
} | null;

/**
 * Convert a poset to its corresponding thin category
 * 
 * Objects: elements of the poset
 * Morphisms: x → y exists iff x ≤ y in the poset
 * Composition: transitivity of ≤
 */
export function thinCategory<T>(P: Poset<T>): Category<T, ThinMor<T>> & {
  hasArrow: (x: T, y: T) => boolean;
  arrow: (x: T, y: T) => ThinMor<T>;
} {
  function hasArrow(x: T, y: T): boolean {
    return P.leq(x, y);
  }

  function arrow(x: T, y: T): ThinMor<T> {
    return hasArrow(x, y) ? { src: x, dst: y } : null;
  }

  function id(x: T): ThinMor<T> {
    return { src: x, dst: x };
  }

  function dom(m: ThinMor<T>): T {
    if (!m) throw new Error("thinCategory.dom: null morphism");
    return m.src;
  }

  function cod(m: ThinMor<T>): T {
    if (!m) throw new Error("thinCategory.cod: null morphism");
    return m.dst;
  }

  function compose(g: ThinMor<T>, f: ThinMor<T>): ThinMor<T> {
    if (!f || !g) return null;
    if (f.dst !== g.src) throw new Error("thinCategory.compose: morphism mismatch");
    
    // Composition exists iff transitivity holds (which it should by assumption)
    return P.leq(f.src, g.dst) ? { src: f.src, dst: g.dst } : null;
  }

  return { id, dom, cod, compose, hasArrow, arrow };
}

// ------------------------------------------------------------
// Monotone maps as functors
// ------------------------------------------------------------

/**
 * Convert a monotone map between posets into a functor between thin categories
 * 
 * A function h: P → Q is monotone iff x ≤ y in P implies h(x) ≤ h(y) in Q
 * This becomes a functor between the corresponding thin categories
 */
export function monotoneAsFunctor<T, U>(
  P: Poset<T>, 
  Q: Poset<U>, 
  h: (t: T) => U
): Functor<T, ThinMor<T>, U, ThinMor<U>> & {
  isMonotone: boolean;
  checkMonotonicity: () => boolean;
} {
  const CP = thinCategory(P);
  const CQ = thinCategory(Q);

  function checkMonotonicity(): boolean {
    for (const x of P.elems) {
      for (const y of P.elems) {
        if (P.leq(x, y) && !Q.leq(h(x), h(y))) {
          return false;
        }
      }
    }
    return true;
  }

  const isMonotone = checkMonotonicity();

  function onObj(t: T): U {
    return h(t);
  }

  function onMor(m: ThinMor<T>): ThinMor<U> {
    if (!m) return null;
    const hx = h(m.src);
    const hy = h(m.dst);
    return Q.leq(hx, hy) ? { src: hx, dst: hy } : null;
  }

  return {
    dom: CP,
    cod: CQ,
    onObj,
    onMor,
    isMonotone,
    checkMonotonicity
  };
}

// ------------------------------------------------------------
// Galois connections as adjunctions
// ------------------------------------------------------------

/**
 * A Galois connection between posets P and Q consists of monotone maps
 * f: P → Q and g: Q → P such that f(x) ≤ y iff x ≤ g(y)
 */
export interface GaloisConnection<T, U> {
  readonly P: Poset<T>;
  readonly Q: Poset<U>;
  readonly f: (x: T) => U; // left adjoint (lower)
  readonly g: (y: U) => T; // right adjoint (upper)
}

/**
 * Check if two monotone maps form a Galois connection
 */
export function checkGaloisConnection<T, U>(
  gc: GaloisConnection<T, U>
): { isGalois: boolean; violations: Array<{x: T; y: U; reason: string}> } {
  const violations: Array<{x: T; y: U; reason: string}> = [];
  
  for (const x of gc.P.elems) {
    for (const y of gc.Q.elems) {
      const fx_leq_y = gc.Q.leq(gc.f(x), y);
      const x_leq_gy = gc.P.leq(x, gc.g(y));
      
      if (fx_leq_y !== x_leq_gy) {
        violations.push({
          x, y,
          reason: `f(${x}) ≤ ${y} is ${fx_leq_y} but ${x} ≤ g(${y}) is ${x_leq_gy}`
        });
      }
    }
  }
  
  return { isGalois: violations.length === 0, violations };
}

/**
 * Convert a Galois connection to an adjunction between thin categories
 */
export function galoisAsAdjunction<T, U>(
  gc: GaloisConnection<T, U>
): {
  F: Functor<T, ThinMor<T>, U, ThinMor<U>>;
  G: Functor<U, ThinMor<U>, T, ThinMor<T>>;
  isAdjunction: boolean;
} {
  const F = monotoneAsFunctor(gc.P, gc.Q, gc.f);
  const G = monotoneAsFunctor(gc.Q, gc.P, gc.g);
  const check = checkGaloisConnection(gc);
  
  return {
    F,
    G,
    isAdjunction: check.isGalois && F.isMonotone && G.isMonotone
  };
}

// ------------------------------------------------------------
// Common poset constructions
// ------------------------------------------------------------

/** Discrete poset: only x ≤ x (no non-trivial order) */
export function discretePoset<T>(elems: ReadonlyArray<T>): Poset<T> {
  return {
    elems,
    leq: (x, y) => x === y
  };
}

/** Total order from a comparison function */
export function totalOrder<T>(
  elems: ReadonlyArray<T>, 
  compare: (x: T, y: T) => number
): Poset<T> {
  return {
    elems,
    leq: (x, y) => compare(x, y) <= 0
  };
}

/** Boolean lattice 2^S as a poset under subset inclusion */
export function powersetPoset<T>(baseSet: ReadonlyArray<T>): Poset<Set<T>> {
  // Generate all subsets
  const subsets: Set<T>[] = [];
  const n = baseSet.length;
  
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = new Set<T>();
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.add(baseSet[i]!);
      }
    }
    subsets.push(subset);
  }

  return {
    elems: subsets,
    leq: (A, B) => {
      // A ⊆ B
      for (const a of A) {
        if (!B.has(a)) return false;
      }
      return true;
    }
  };
}

/** Divisibility poset on positive integers */
export function divisibilityPoset(maxN: number): Poset<number> {
  const elems = Array.from({length: maxN}, (_, i) => i + 1);
  return {
    elems,
    leq: (x, y) => y % x === 0 // x divides y
  };
}

// ------------------------------------------------------------
// Utility functions for poset analysis
// ------------------------------------------------------------

/** Find all minimal elements in a poset */
export function minimals<T>(P: Poset<T>): T[] {
  return P.elems.filter(x => 
    !P.elems.some(y => P.leq(y, x) && y !== x)
  );
}

/** Find all maximal elements in a poset */
export function maximals<T>(P: Poset<T>): T[] {
  return P.elems.filter(x => 
    !P.elems.some(y => P.leq(x, y) && y !== x)
  );
}

/** Compute the meet (greatest lower bound) of two elements if it exists */
export function meet<T>(P: Poset<T>, x: T, y: T): T | null {
  // Find the greatest element z such that z ≤ x and z ≤ y
  let best: T | null = null;
  for (const z of P.elems) {
    if (P.leq(z, x) && P.leq(z, y)) {
      if (best === null || P.leq(best, z)) {
        best = z;
      }
    }
  }
  return best;
}

/** Compute the join (least upper bound) of two elements if it exists */
export function join<T>(P: Poset<T>, x: T, y: T): T | null {
  // Find the least element z such that x ≤ z and y ≤ z
  let best: T | null = null;
  for (const z of P.elems) {
    if (P.leq(x, z) && P.leq(y, z)) {
      if (best === null || P.leq(z, best)) {
        best = z;
      }
    }
  }
  return best;
}