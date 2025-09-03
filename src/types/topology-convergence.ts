/** @math THM-ULTRAFILTER-MONAD */

import { SetObj } from "./catkit-kan.js";
import { Topology, preimage } from "./topology.js";
import { ultrafilterFromCodensity } from "./ultrafilter.js";
import { UF } from "./ultrafilter-monad.js";

/** The set of open neighborhoods of x. */
export function neighborhoods<A>(TX: Topology<A>, x: A): Array<Set<A>> {
  const opens: Array<Set<A>> = [];
  
  for (const enc of TX.opens) {
    const U = decodeSubset(TX, enc);
    if (U.has(x)) opens.push(U);
  }
  return opens;
}

/** U converges to x iff every neighborhood of x is in U. */
export function converges<A>(
  TX: Topology<A>,
  U: { contains: (S: Set<A>) => boolean },
  x: A
): boolean {
  for (const N of neighborhoods(TX, x)) {
    if (!U.contains(N)) return false;
  }
  return true;
}

/** Pushforward (image) of an ultrafilter along f: X -> Y.
 * U'(S) := U(f^{-1}(S)).
 */
export function pushforwardUltrafilter<A, B>(
  TX: Topology<A>,
  TY: Topology<B>,
  f: (a: A) => B,
  U: { contains: (S: Set<A>) => boolean }
): { contains: (S: Set<B>) => boolean } {
  return {
    contains: (SB: Set<B>) => {
      const pre = preimage(TX.carrier, TY.carrier, f, SB);
      return U.contains(pre);
    }
  };
}

/** Finite-space EM map via unique limit:
 * alpha_X : U(X) -> X  returns the unique x such that U -> x, else throws.
 * (On compact Hausdorff spaces uniqueness exists; all finite spaces are compact,
 * and Hausdorff holds e.g. for discrete topologies.)
 */
export function alphaViaLimit<A>(TX: Topology<A>) {
  return (t: any): A => {
    const U = ultrafilterFromCodensity<A>(TX.carrier, t);
    const xs = Array.from(TX.carrier.elems) as A[];
    const limits = xs.filter(x => converges(TX, U, x));
    
    if (limits.length !== 1) {
      throw new Error(`Ultrafilter has ${limits.length} limit points; need exactly one for EM algebra.`);
    }
    return limits[0]!;
  };
}

/**
 * Verify that the EM algebra structure map satisfies the limit property
 * For compact Hausdorff spaces, every ultrafilter converges to a unique point
 */
export function verifyEMViaLimits<A>(
  TX: Topology<A>,
  testPoints: A[]
): {
  allConvergeUniquely: boolean;
  convergenceResults: Array<{ point: A; converges: boolean; limitCount: number }>;
} {
  const results = testPoints.map(a => {
    const t = UF.of(TX.carrier)(a);
    const U = ultrafilterFromCodensity<A>(TX.carrier, t);
    
    const xs = Array.from(TX.carrier.elems) as A[];
    const limits = xs.filter(x => converges(TX, U, x));
    
    return {
      point: a,
      converges: limits.length === 1 && limits[0] === a,
      limitCount: limits.length
    };
  });
  
  const allConvergeUniquely = results.every(r => r.converges);
  
  return {
    allConvergeUniquely,
    convergenceResults: results
  };
}

/**
 * Demonstrate ultrafilter convergence properties
 */
export function demonstrateUltrafilterConvergence() {
  console.log("🔧 ULTRAFILTER CONVERGENCE DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\nConcepts:");
  console.log("  • Ultrafilter U converges to x iff every neighborhood of x is in U");
  console.log("  • Pushforward: f_*(U)(S) := U(f^{-1}(S))");
  console.log("  • EM algebra: α(U) = unique limit point of U");
  
  console.log("\\nTopological Properties:");
  console.log("  • Compact spaces: Every ultrafilter converges");
  console.log("  • Hausdorff spaces: Convergence is unique");
  console.log("  • Finite discrete: Both compact and Hausdorff");
  
  console.log("\\nEM Algebra Connection:");
  console.log("  • α: U(X) → X picks the unique convergence point");
  console.log("  • Manes theorem: EM algebras ≅ compact Hausdorff spaces");
  console.log("  • Finite case: Principal ultrafilters converge to their point");
  
  console.log("\\n🎯 Ready for topological ultrafilter theory!");
}

// ----- internal: decode subset bitstring from Topology.ts -----
function decodeSubset<A>(TX: Topology<A>, bits: string): Set<A> {
  const as = Array.from(TX.carrier.elems) as A[];
  const out = new Set<A>();
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") out.add(as[i]!);
  }
  return out;
}