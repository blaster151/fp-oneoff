#!/usr/bin/env tsx

/**
 * Run the First Isomorphism Theorem Witness System demonstration
 */

import { FinGroup, FinGroupMor, makeFinGroup } from "../src/cat/grp/FinGrp";
import { firstIsoWitness, firstIso } from "../src/cat/grp/first_iso";
import { assertIsIso, assertIsMono, assertIsEpi, assertIsHomomorphism } from "./guards/iso-guard";

// Define test groups
const Z8: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3,4,5,6,7],
  e: 0,
  op: (a,b) => (a + b) % 8,
  inv: a => (8 - (a % 8)) % 8,
  eq: (a,b) => a === b
});

const Z4: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3],
  e: 0,
  op: (a,b) => (a + b) % 4,
  inv: a => (4 - (a % 4)) % 4,
  eq: (a,b) => a === b
});

const Z2: FinGroup<number> = makeFinGroup({
  carrier: [0,1],
  e: 0,
  op: (a,b) => (a + b) % 2,
  inv: a => a % 2,
  eq: (a,b) => a === b
});

// Helper function to create homomorphisms
function hom<A, B>(src: FinGroup<A>, dst: FinGroup<B>, fn: (a: A) => B): FinGroupMor<A, B> {
  return { src, dst, run: fn };
}

console.log("FIRST ISOMORPHISM THEOREM WITNESS SYSTEM");
console.log("=========================================");
console.log("Demonstrating executable proof with guardrails that fail builds");
console.log("if mathematical laws are violated.");
console.log();

// Test 1: Surjective but not injective homomorphism
console.log("=== TEST 1: f: Z8 → Z4, f(n) = n mod 4 ===");
const f = hom(Z8, Z4, (n) => n % 4);
const witness1 = firstIsoWitness(Z8, Z4, f);
console.log("Witness:", witness1);

console.log("\nGuardrail tests:");
try {
  assertIsIso(witness1);
  console.log("✓ assertIsIso passed (unexpected!)");
} catch (e) {
  console.log("✗ assertIsIso failed as expected:", e.message);
}

try {
  assertIsMono(witness1);
  console.log("✓ assertIsMono passed (unexpected!)");
} catch (e) {
  console.log("✗ assertIsMono failed as expected:", e.message);
}

try {
  assertIsEpi(witness1);
  console.log("✓ assertIsEpi passed");
} catch (e) {
  console.log("✗ assertIsEpi failed:", e.message);
}

try {
  assertIsHomomorphism(witness1);
  console.log("✓ assertIsHomomorphism passed");
} catch (e) {
  console.log("✗ assertIsHomomorphism failed:", e.message);
}

// Test 2: Identity isomorphism
console.log("\n=== TEST 2: id: Z4 → Z4, id(n) = n ===");
const id = hom(Z4, Z4, (n) => n);
const witness2 = firstIsoWitness(Z4, Z4, id);
console.log("Witness:", witness2);

console.log("\nGuardrail tests:");
try {
  assertIsIso(witness2);
  console.log("✓ assertIsIso passed");
} catch (e) {
  console.log("✗ assertIsIso failed:", e.message);
}

try {
  assertIsMono(witness2);
  console.log("✓ assertIsMono passed");
} catch (e) {
  console.log("✗ assertIsMono failed:", e.message);
}

try {
  assertIsEpi(witness2);
  console.log("✓ assertIsEpi passed");
} catch (e) {
  console.log("✗ assertIsEpi failed:", e.message);
}

try {
  assertIsHomomorphism(witness2);
  console.log("✓ assertIsHomomorphism passed");
} catch (e) {
  console.log("✗ assertIsHomomorphism failed:", e.message);
}

// Test 3: Injective but not surjective homomorphism
console.log("\n=== TEST 3: i: Z2 → Z8, i(n) = n * 4 ===");
const i = hom(Z2, Z8, (n) => n * 4);
const witness3 = firstIsoWitness(Z2, Z8, i);
console.log("Witness:", witness3);

console.log("\nGuardrail tests:");
try {
  assertIsIso(witness3);
  console.log("✓ assertIsIso passed (unexpected!)");
} catch (e) {
  console.log("✗ assertIsIso failed as expected:", e.message);
}

try {
  assertIsMono(witness3);
  console.log("✓ assertIsMono passed");
} catch (e) {
  console.log("✗ assertIsMono failed:", e.message);
}

try {
  assertIsEpi(witness3);
  console.log("✓ assertIsEpi passed (unexpected!)");
} catch (e) {
  console.log("✗ assertIsEpi failed as expected:", e.message);
}

try {
  assertIsHomomorphism(witness3);
  console.log("✓ assertIsHomomorphism passed");
} catch (e) {
  console.log("✗ assertIsHomomorphism failed:", e.message);
}

// Demonstrate the First Isomorphism Theorem
console.log("\n=== FIRST ISOMORPHISM THEOREM DEMONSTRATION ===");
const { cosets, img, phi } = firstIso(Z8, Z4, f);
console.log("Given f: Z8 → Z4, f(n) = n mod 4");
console.log("Kernel ker(f) = [0, 4]");
console.log("Cosets G/ker(f) =", cosets);
console.log("Image im(f) =", img);
console.log("Isomorphism φ: G/ker(f) → im(f)");

for (let i = 0; i < cosets.length; i++) {
  const coset = cosets[i];
  const imageElement = phi(coset);
  console.log(`  φ([${coset.join(', ')}]) = ${imageElement}`);
}

console.log("\n=== CONCLUSION ===");
console.log("The witness system provides executable proof of the First Isomorphism Theorem.");
console.log("Guardrails ensure that builds fail if mathematical laws are violated.");
console.log("This bridges the gap between mathematical theory and computational verification.");
