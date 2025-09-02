// posets-as-categories-demo.ts
// Demonstration of posets as thin categories
// Shows the deep connection between order theory and category theory

import { 
  Poset, thinCategory, monotoneAsFunctor, checkGaloisConnection, galoisAsAdjunction,
  discretePoset, totalOrder, powersetPoset, divisibilityPoset,
  minimals, maximals, meet, join
} from "../types/catkit-posets.js";

console.log("=".repeat(80));
console.log("POSETS AS CATEGORIES DEMO");
console.log("=".repeat(80));

// ------------------------------------------------------------
// Example 1: Simple finite poset
// ------------------------------------------------------------

console.log("\n1. SIMPLE FINITE POSET");

const P3: Poset<number> = {
  elems: [1, 2, 3, 4],
  leq: (x, y) => {
    // Diamond lattice: 1 ≤ {2,3} ≤ 4
    if (x === y) return true;
    if (x === 1) return true;
    if (y === 4) return true;
    return false;
  }
};

console.log("Poset P3: 1 ≤ {2,3} ≤ 4 (diamond)");
console.log("Elements:", P3.elems);
console.log("Minimals:", minimals(P3));
console.log("Maximals:", maximals(P3));

const CP3 = thinCategory(P3);
console.log("As thin category:");
console.log("  1 → 2:", CP3.hasArrow(1, 2));
console.log("  2 → 3:", CP3.hasArrow(2, 3));
console.log("  1 → 4:", CP3.hasArrow(1, 4));

// Test meets and joins
console.log("meet(2,3):", meet(P3, 2, 3)); // should be 1
console.log("join(2,3):", join(P3, 2, 3)); // should be 4

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 2: Monotone maps as functors
// ------------------------------------------------------------

console.log("\n2. MONOTONE MAPS AS FUNCTORS");

const P2: Poset<string> = {
  elems: ["a", "b"],
  leq: (x, y) => x === "a" || x === y // a ≤ b, b ≤ b, a ≤ a
};

// Monotone map h: P3 → P2
const h = (x: number): string => x <= 2 ? "a" : "b";

const H = monotoneAsFunctor(P3, P2, h);
console.log("Map h: P3 → P2 where h(x) = (x ≤ 2 ? 'a' : 'b')");
console.log("Is monotone:", H.isMonotone);

// Test functor on morphisms
const arrow_1_4 = CP3.arrow(1, 4);
if (arrow_1_4) {
  const h_arrow = H.onMor(arrow_1_4);
  console.log("h(1 → 4) =", h_arrow ? `${h_arrow.src} → ${h_arrow.dst}` : "null");
}

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 3: Galois connections
// ------------------------------------------------------------

console.log("\n3. GALOIS CONNECTIONS");

// Classic example: (∀, ∃) on powersets
const baseSet = ["x", "y"];
const PowerP = powersetPoset(baseSet);

console.log("Powerset of {x,y}:");
PowerP.elems.forEach((s, i) => {
  const elems = Array.from(s).join(",");
  console.log(`  [${i}]: {${elems}}`);
});

// Galois connection between P(S) and P(S) via complement
const complement = (A: Set<string>): Set<string> => {
  const comp = new Set<string>();
  for (const x of baseSet) {
    if (!A.has(x)) comp.add(x);
  }
  return comp;
};

// Self-dual: complement is its own inverse
const galois = {
  P: PowerP,
  Q: PowerP,
  f: complement, // lower adjoint
  g: complement  // upper adjoint
};

const galoisCheck = checkGaloisConnection(galois);
console.log("Complement Galois connection:");
console.log("Is valid Galois connection:", galoisCheck.isGalois);
if (!galoisCheck.isGalois) {
  console.log("Violations:", galoisCheck.violations.slice(0, 3));
}

const adjunction = galoisAsAdjunction(galois);
console.log("As adjunction F ⊣ G:", adjunction.isAdjunction);

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 4: Divisibility poset
// ------------------------------------------------------------

console.log("\n4. DIVISIBILITY POSET");

const Div12 = divisibilityPoset(12);
console.log("Divisors of 1..12 under divisibility:");
console.log("Elements:", Div12.elems);

// Show some divisibility relations
console.log("Relations:");
console.log("  2 | 6:", Div12.leq(2, 6));
console.log("  3 | 6:", Div12.leq(3, 6));
console.log("  6 | 12:", Div12.leq(6, 12));
console.log("  4 | 6:", Div12.leq(4, 6));

// Meets and joins in divisibility lattice
console.log("meet(6,9) = gcd(6,9):", meet(Div12, 6, 9)); // should be 3
console.log("join(6,9) = lcm(6,9):", join(Div12, 6, 9)); // should be 18 if in range

const CDivs = thinCategory(Div12);
console.log("As thin category, arrows correspond to divisibility");

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 5: Total orders
// ------------------------------------------------------------

console.log("\n5. TOTAL ORDERS");

const NumOrder = totalOrder([1, 3, 2, 5, 4], (x, y) => x - y);
console.log("Total order on [1,3,2,5,4] by numeric comparison:");
console.log("Sorted elements:", [...NumOrder.elems].sort((x,y) => x-y));

const CNum = thinCategory(NumOrder);
console.log("Order relations:");
console.log("  1 ≤ 3:", CNum.hasArrow(1, 3));
console.log("  3 ≤ 2:", CNum.hasArrow(3, 2));
console.log("  2 ≤ 5:", CNum.hasArrow(2, 5));

console.log("\n" + "=".repeat(80));
console.log("POSET FEATURES DEMONSTRATED:");
console.log("✓ Posets as thin categories (at most one morphism x → y)");
console.log("✓ Monotone maps as functors between thin categories");
console.log("✓ Galois connections as adjunctions");
console.log("✓ Meets/joins as limits/colimits");
console.log("✓ Common poset constructions (discrete, total, powerset, divisibility)");
console.log("✓ Integration with general category theory framework");
console.log("=".repeat(80));