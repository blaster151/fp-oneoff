#!/usr/bin/env tsx

/**
 * Run the plural idiom demonstration
 */

import { FinGroup, FinGroupMor, makeFinGroup } from "../src/cat/grp/FinGrp";
import { demonstratePluralIdiom, showIdiomConvergence } from "../src/cat/grp/PluralIdiomDemo";

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

// Create homomorphism f: Z8 → Z4, f(n) = n mod 4
const f: FinGroupMor<number, number> = {
  src: Z8,
  dst: Z4,
  run: (n) => n % 4
};

console.log("PLURAL IDIOM DEMONSTRATION");
console.log("==========================");
console.log("Showing how our First Isomorphism Theorem implementation");
console.log("naturally follows the plural idiom without ever appealing");
console.log("to 'set objects' or 'the set of elements'.");
console.log();

demonstratePluralIdiom(Z8, Z4, f);
showIdiomConvergence(Z8, Z4, f);

console.log("\n=== CONCLUSION ===");
console.log("The plural idiom makes the First Isomorphism Theorem feel natural.");
console.log("We don't need to hypostasize 'the set underlying G' as a single object;");
console.log("we just say: a group G consists of *some elements* with a binary operation.");
console.log("Then the kernel, image, cosets, and isomorphism all follow naturally");
console.log("from 'those elements' and 'those cosets' - no set theory required!");
