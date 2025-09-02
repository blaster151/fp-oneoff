// galois-connections-demo.ts
// Advanced demonstration of Galois connections as adjunctions between posets
// Shows how order-theoretic concepts translate to categorical ones

import { 
  Poset, thinCategory, GaloisConnection, checkGaloisConnection, galoisAsAdjunction,
  powersetPoset, totalOrder, meet, join
} from "../types/catkit-posets.js";

console.log("=".repeat(80));
console.log("GALOIS CONNECTIONS AS ADJUNCTIONS DEMO");
console.log("=".repeat(80));

// ------------------------------------------------------------
// Example 1: Classic Galois connection - closure/interior
// ------------------------------------------------------------

console.log("\n1. CLOSURE/INTERIOR GALOIS CONNECTION");

// Topology on {1,2,3}: open sets are {}, {2}, {1,2,3}
const topologyBase = [1, 2, 3];
const openSets = [
  new Set<number>([]),      // ∅
  new Set<number>([2]),     // {2}  
  new Set<number>([1,2,3])  // {1,2,3}
];

const OpenPoset: Poset<Set<number>> = {
  elems: openSets,
  leq: (A, B) => {
    // A ⊆ B (subset inclusion)
    for (const a of A) {
      if (!B.has(a)) return false;
    }
    return true;
  }
};

const ClosedPoset: Poset<Set<number>> = {
  elems: [
    new Set<number>([1,2,3]), // {1,2,3} (complement of ∅)
    new Set<number>([1,3]),   // {1,3} (complement of {2})
    new Set<number>([])       // ∅ (complement of {1,2,3})
  ],
  leq: (A, B) => {
    // A ⊇ B (reverse inclusion for closed sets)
    for (const b of B) {
      if (!A.has(b)) return false;
    }
    return true;
  }
};

// Interior: largest open set contained in a closed set
const interior = (C: Set<number>): Set<number> => {
  for (const O of OpenPoset.elems) {
    let contained = true;
    for (const o of O) {
      if (!C.has(o)) { contained = false; break; }
    }
    if (contained) {
      // Check if this is the largest such open set
      let isLargest = true;
      for (const O2 of OpenPoset.elems) {
        if (O2 !== O) {
          let O2contained = true;
          for (const o of O2) {
            if (!C.has(o)) { O2contained = false; break; }
          }
          if (O2contained && OpenPoset.leq(O, O2)) {
            isLargest = false; break;
          }
        }
      }
      if (isLargest) return O;
    }
  }
  return new Set<number>([]);
};

// Closure: smallest closed set containing an open set  
const closure = (O: Set<number>): Set<number> => {
  for (const C of ClosedPoset.elems) {
    let contains = true;
    for (const o of O) {
      if (!C.has(o)) { contains = false; break; }
    }
    if (contains) {
      // Check if this is the smallest such closed set
      let isSmallest = true;
      for (const C2 of ClosedPoset.elems) {
        if (C2 !== C) {
          let C2contains = true;
          for (const o of O) {
            if (!C2.has(o)) { C2contains = false; break; }
          }
          if (C2contains && ClosedPoset.leq(C2, C)) {
            isSmallest = false; break;
          }
        }
      }
      if (isSmallest) return C;
    }
  }
  return new Set<number>([1,2,3]);
};

const topologyGalois: GaloisConnection<Set<number>, Set<number>> = {
  P: OpenPoset,
  Q: ClosedPoset,
  f: closure,   // closure: Open → Closed
  g: interior   // interior: Closed → Open
};

const galoisCheck1 = checkGaloisConnection(topologyGalois);
console.log("Closure ⊣ Interior Galois connection:");
console.log("Is valid:", galoisCheck1.isGalois);

if (galoisCheck1.isGalois) {
  const adj = galoisAsAdjunction(topologyGalois);
  console.log("As categorical adjunction:", adj.isAdjunction);
}

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 2: Divisibility lattice Galois connection
// ------------------------------------------------------------

console.log("\n2. DIVISIBILITY LATTICE");

const Div6 = divisibilityPoset(6);
console.log("Divisors of 1..6:", Div6.elems);

// Show the lattice structure
console.log("Divisibility relations:");
for (let i = 1; i <= 6; i++) {
  const divisors = Div6.elems.filter(d => Div6.leq(d, i));
  console.log(`  divisors of ${i}:`, divisors);
}

// GCD and LCM as meet and join
console.log("Lattice operations:");
console.log("  meet(4,6) = gcd(4,6) =", meet(Div6, 4, 6));
console.log("  join(4,6) = lcm(4,6) =", join(Div6, 4, 6));

const CDivs = thinCategory(Div6);
console.log("As thin category, composition is transitivity of divisibility");

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 3: Powerset Boolean algebra
// ------------------------------------------------------------

console.log("\n3. POWERSET BOOLEAN ALGEBRA");

const base = ["a", "b"];
const PowerAB = powersetPoset(base);

console.log("Powerset of {a,b}:");
PowerAB.elems.forEach((s, i) => {
  const elems = Array.from(s).sort().join(",");
  console.log(`  [${i}]: {${elems}}`);
});

// Boolean operations as meets and joins
const setA = new Set(["a"]);
const setB = new Set(["b"]);

console.log("Boolean algebra operations:");
console.log("  {a} ∩ {b} = meet =", 
  Array.from(meet(PowerAB, setA, setB) || new Set()).join(","));
console.log("  {a} ∪ {b} = join =", 
  Array.from(join(PowerAB, setA, setB) || new Set()).join(","));

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 4: Order-preserving maps and adjunctions
// ------------------------------------------------------------

console.log("\n4. ORDER-PRESERVING MAPS");

// Map from divisibility to size ordering
const sizeOrder = totalOrder([1,2,3,4,5,6], (x,y) => x - y);

const sizeMap = (n: number): number => n; // identity, but different orderings
const SizeFunc = monotoneAsFunctor(Div6, sizeOrder, sizeMap);

console.log("Identity map: Divisibility → Size ordering");
console.log("Is monotone:", SizeFunc.isMonotone);

// This should be monotone: if a|b then a ≤ b in size
// (true for positive integers)

console.log("\n" + "=".repeat(80));
console.log("POSET-CATEGORY BRIDGE FEATURES:");
console.log("✓ Posets as thin categories (x ≤ y becomes unique arrow x → y)");
console.log("✓ Monotone maps as functors (preserve order = preserve morphisms)"); 
console.log("✓ Galois connections as adjunctions (F ⊣ G between posets)");
console.log("✓ Meets/joins as limits/colimits in thin categories");
console.log("✓ Boolean algebras, lattices, and order structures");
console.log("✓ Integration with general categorical constructions");
console.log("=".repeat(80));

console.log("\n🎯 THEORETICAL CONNECTIONS:");
console.log("• Subtyping systems → Posets → Thin categories");
console.log("• Constraint entailment → Order relations → Categorical morphisms");
console.log("• Closure operators → Monads on posets → Categorical monads");
console.log("• Galois connections → Adjunctions → Kan extensions");