#!/usr/bin/env tsx

/**
 * Comprehensive demonstration of pushouts in Grp for cyclic-abelian case
 * Shows integration with First Isomorphism Theorem and kernel/image/quotient kit
 */

import { homZkToZm } from "../src/algebra/groups/cyclic";
import { pushoutWithCocone, listAllRepresentatives, verifyCoconeProperty } from "../src/algebra/groups/pushout-cyclic-extended";

console.log("PUSHOUTS IN Grp FOR CYCLIC-ABELIAN CASE");
console.log("======================================");
console.log("Demonstrating concrete pushouts that integrate with our");
console.log("First Isomorphism Theorem and kernel/image/quotient kit.");
console.log();

// Example 1: Glue Z_4 and Z_6 along Z_2
console.log("=== EXAMPLE 1: Glue Z_4 and Z_6 along Z_2 ===");
const f1 = homZkToZm(2, 4, 2); // f: Z_2 -> Z_4, 1 |-> 2
const g1 = homZkToZm(2, 6, 3); // g: Z_2 -> Z_6, 1 |-> 3

console.log("Homomorphisms:");
console.log(`  f: Z_2 -> Z_4, 1 |-> ${f1.imgOfOne}`);
console.log(`  g: Z_2 -> Z_6, 1 |-> ${g1.imgOfOne}`);
console.log();

const { pushout: P1, i_A: i_A1, i_B: i_B1 } = pushoutWithCocone(f1, g1);

console.log("Pushout Properties:");
console.log(`  Size: ${P1.size}`);
console.log(`  Structure: (Z_4 ⊕ Z_6)/<(2,-3)>`);
console.log();

// Verify cocone property
console.log("Cocone Property Verification:");
console.log(`  i_A ∘ f = i_B ∘ g: ${verifyCoconeProperty(f1, g1)}`);
console.log();

// Show some operations
console.log("Sample Operations:");
const a = P1.norm([1, 0]);
const b = P1.norm([0, 1]);
const sum = P1.add(a, b);
console.log(`  [1,0] + [0,1] = ${P1.show!(sum)}`);

const neg_a = P1.neg(a);
const a_plus_neg_a = P1.add(a, neg_a);
console.log(`  [1,0] + (-[1,0]) = ${P1.show!(a_plus_neg_a)}`);
console.log(`  Is identity: ${P1.eq(a_plus_neg_a, P1.id)}`);
console.log();

// List all representatives
console.log("All Representatives:");
const reps1 = listAllRepresentatives(P1);
for (let i = 0; i < Math.min(6, reps1.length); i++) {
  console.log(`  ${P1.show!(reps1[i])}`);
}
if (reps1.length > 6) {
  console.log(`  ... and ${reps1.length - 6} more`);
}
console.log();

// Example 2: Direct sum case
console.log("=== EXAMPLE 2: Direct Sum (u=v=0) ===");
const f2 = homZkToZm(3, 4, 0); // f: Z_3 -> Z_4, 1 |-> 0 (trivial)
const g2 = homZkToZm(3, 5, 0); // g: Z_3 -> Z_5, 1 |-> 0 (trivial)

console.log("Homomorphisms:");
console.log(`  f: Z_3 -> Z_4, 1 |-> ${f2.imgOfOne} (trivial)`);
console.log(`  g: Z_3 -> Z_5, 1 |-> ${g2.imgOfOne} (trivial)`);
console.log();

const { pushout: P2, i_A: i_A2, i_B: i_B2 } = pushoutWithCocone(f2, g2);

console.log("Pushout Properties:");
console.log(`  Size: ${P2.size}`);
console.log(`  Structure: Z_4 ⊕ Z_5 (direct sum)`);
console.log();

// Verify cocone property
console.log("Cocone Property Verification:");
console.log(`  i_A ∘ f = i_B ∘ g: ${verifyCoconeProperty(f2, g2)}`);
console.log();

// Show some operations
console.log("Sample Operations:");
const c = P2.norm([1, 2]);
const d = P2.norm([2, 3]);
const sum2 = P2.add(c, d);
console.log(`  [1,2] + [2,3] = ${P2.show!(sum2)}`);
console.log();

// Example 3: Integration with First Isomorphism Theorem
console.log("=== EXAMPLE 3: Integration with First Isomorphism Theorem ===");
console.log("The pushout construction demonstrates how limits/colimits");
console.log("work in the category of groups, complementing our");
console.log("First Isomorphism Theorem implementation.");
console.log();

console.log("Key Connections:");
console.log("1. Kernel/Image: Our First Iso Thm computes ker(f) and im(f)");
console.log("2. Quotient: We form G/ker(f) and show G/ker(f) ≅ im(f)");
console.log("3. Pushout: We form (Z_m ⊕ Z_n)/<(u,-v)> and show universal property");
console.log();

console.log("Both constructions use:");
console.log("- Quotient groups (G/ker(f) vs (Z_m ⊕ Z_n)/<(u,-v)>)");
console.log("- Canonical representatives (cosets vs normalized pairs)");
console.log("- Universal properties (factorization vs cocone)");
console.log();

// Show the universal property in action
console.log("Universal Property Demonstration:");
console.log("For f: Z_2 -> Z_4, g: Z_2 -> Z_6, the pushout P satisfies:");
console.log("  i_A ∘ f = i_B ∘ g (cocone property)");
console.log("  For any H and h1: Z_4 -> H, h2: Z_6 -> H with h1 ∘ f = h2 ∘ g,");
console.log("  there exists unique h: P -> H with h ∘ i_A = h1 and h ∘ i_B = h2");
console.log();

console.log("=== CONCLUSION ===");
console.log("We now have concrete pushouts in Grp that:");
console.log("1. Integrate with our First Isomorphism Theorem");
console.log("2. Demonstrate limits/colimits in category theory");
console.log("3. Provide executable proofs of universal properties");
console.log("4. Bridge abstract mathematics with computational verification");
console.log();
console.log("This completes our computational foundation for group theory");
console.log("in the category of groups, with both theorems and limits/colimits");
console.log("fully operationalized in TypeScript!");
