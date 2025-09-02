// fingertree-demo.ts
// Demonstration of FingerTree persistent sequence operations
// Shows O(1) end operations and O(log n) splitting

import { 
  FingerTree, Empty, pushL, pushR, popL, popR, concat, splitAt,
  fromArray, toArray, ftSize, map, filter, foldl,
  benchmarkFingerTree
} from "../types/fingertree.js";

console.log("=".repeat(80));
console.log("FINGERTREE PERSISTENT SEQUENCE DEMO");
console.log("=".repeat(80));

export function demo() {
  console.log("\n1. BASIC OPERATIONS");

  // Build a sequence
  let ft = Empty<number>();
  console.log("Empty tree size:", ftSize(ft));

  // Push elements
  ft = pushR(ft, 1);
  ft = pushR(ft, 2);
  ft = pushL(0, ft);
  ft = pushR(ft, 3);
  
  console.log("After pushes:", toArray(ft));
  console.log("Size:", ftSize(ft));

  // Pop elements
  const leftPop = popL(ft);
  if (leftPop) {
    console.log("Pop left:", leftPop.head, "remaining:", toArray(leftPop.tail));
  }

  const rightPop = popR(ft);
  if (rightPop) {
    console.log("Pop right:", rightPop.last, "remaining:", toArray(rightPop.init));
  }

  console.log("\n2. SEQUENCE CONSTRUCTION");

  // Build from array
  const seq1 = fromArray([1, 2, 3, 4, 5]);
  const seq2 = fromArray([6, 7, 8, 9, 10]);
  
  console.log("Sequence 1:", toArray(seq1));
  console.log("Sequence 2:", toArray(seq2));

  // Concatenation
  const combined = concat(seq1, seq2);
  console.log("Concatenated:", toArray(combined));
  console.log("Combined size:", ftSize(combined));

  console.log("\n3. SPLITTING OPERATIONS");

  // Split at various positions
  const { left: left1, right: right1 } = splitAt(combined, 3);
  console.log("Split at 3:");
  console.log("  Left:", toArray(left1));
  console.log("  Right:", toArray(right1));

  const { left: left2, right: right2 } = splitAt(combined, 7);
  console.log("Split at 7:");
  console.log("  Left:", toArray(left2));
  console.log("  Right:", toArray(right2));

  console.log("\n4. FUNCTIONAL OPERATIONS");

  // Map, filter, fold
  const doubled = map(seq1, x => x * 2);
  console.log("Doubled:", toArray(doubled));

  const evens = filter(combined, x => x % 2 === 0);
  console.log("Evens:", toArray(evens));

  const sum = foldl(combined, (acc, x) => acc + x, 0);
  console.log("Sum:", sum);

  console.log("\n5. PERFORMANCE CHARACTERISTICS");

  // Test with larger sequences
  const sizes = [100, 1000, 10000];
  
  for (const size of sizes) {
    console.log(`\nBenchmarking size ${size}:`);
    const bench = benchmarkFingerTree(size);
    
    console.log(`  Construction: ${bench.construction.toFixed(2)}ms`);
    console.log(`  Left ops (100x): ${bench.leftOps.toFixed(2)}ms`);
    console.log(`  Right ops (100x): ${bench.rightOps.toFixed(2)}ms`);
    console.log(`  Splitting (10x): ${bench.splitting.toFixed(2)}ms`);
    console.log(`  Concatenation (10x): ${bench.concatenation.toFixed(2)}ms`);
  }

  console.log("\n6. USE CASES FOR CATEGORICAL PROGRAMMING");

  console.log("FingerTree applications in fp-oneoff:");
  console.log("  • Rewrite traces: O(1) append, O(log n) split for debugging");
  console.log("  • Proof derivations: Persistent sequences of inference steps");
  console.log("  • Homology chains: Efficient manipulation of chain complexes");
  console.log("  • Effect logs: Accumulate effect descriptions with fast access");
  console.log("  • AST sequences: Program transformation with structural sharing");

  console.log("\n" + "=".repeat(80));
  console.log("FINGERTREE FEATURES:");
  console.log("✓ O(1) amortized push/pop at both ends");
  console.log("✓ O(log n) splitting at arbitrary positions");
  console.log("✓ O(1) concatenation of sequences");
  console.log("✓ Persistent (immutable) with structural sharing");
  console.log("✓ Size-indexed for efficient random access");
  console.log("✓ Functional operations (map, filter, fold)");
  console.log("=".repeat(80));

  console.log("\n🎯 PERFORMANCE ADVANTAGES:");
  console.log("• Persistent updates without full copying");
  console.log("• Structural sharing reduces memory usage");
  console.log("• Amortized constant time for common operations");
  console.log("• Efficient concatenation for large sequences");
  console.log("• Cache-friendly access patterns");
}

demo();