// rope-demo.ts
// Demo for Rope on measured FingerTree.

import { fromString, toString, insertAt, slice, concat, length, charAt, lines, unlines, replaceAt, benchmarkRope } from "../types/rope.js";

console.log("=".repeat(80));
console.log("ROPE PERSISTENT TEXT STRUCTURE DEMO");
console.log("=".repeat(80));

export function demo() {
  console.log("\n1. BASIC ROPE OPERATIONS");

  const r1 = fromString("Hello ");
  const r2 = fromString("World!");
  const r = concat(r1, r2);
  
  console.log("Concatenated:", toString(r));
  console.log("Length:", length(r));

  const r3 = insertAt(r, 6, "beautiful ");
  console.log("After insertion:", toString(r3));
  console.log("New length:", length(r3));

  const r4 = slice(r3, 6, 15);
  console.log("Slice (6,15):", toString(r4));

  console.log("\n2. CHARACTER ACCESS");
  
  console.log("Character at position 0:", charAt(r3, 0));
  console.log("Character at position 6:", charAt(r3, 6));
  console.log("Character at position 10:", charAt(r3, 10));

  console.log("\n3. LINE OPERATIONS");
  
  const multiline = fromString("Line 1\nLine 2\nLine 3");
  const lineRopes = lines(multiline);
  
  console.log("Original multiline:", toString(multiline));
  console.log("Split into lines:", lineRopes.map(toString));
  
  const rejoined = unlines(lineRopes);
  console.log("Rejoined:", toString(rejoined));

  console.log("\n4. TEXT EDITING");
  
  const document = fromString("The quick brown fox jumps over the lazy dog");
  console.log("Original:", toString(document));
  
  const edited = replaceAt(document, 4, 9, "slow");
  console.log("After replace:", toString(edited));
  
  const inserted = insertAt(edited, 0, "Once upon a time: ");
  console.log("After prefix insert:", toString(inserted));

  console.log("\n5. PERFORMANCE CHARACTERISTICS");
  
  const sizes = [1000, 10000, 100000];
  
  for (const size of sizes) {
    console.log(`\nBenchmarking rope size ${size}:`);
    const bench = benchmarkRope(size);
    
    console.log(`  Construction: ${bench.construction.toFixed(2)}ms`);
    console.log(`  Concatenation: ${bench.concatenation.toFixed(2)}ms`);
    console.log(`  Insertion: ${bench.insertion.toFixed(2)}ms`);
    console.log(`  Slicing: ${bench.slicing.toFixed(2)}ms`);
  }

  console.log("\n6. ROPE ADVANTAGES");
  
  console.log("Rope benefits for large text:");
  console.log("  • O(1) concatenation vs O(n) string concatenation");
  console.log("  • O(log n) insertion/deletion vs O(n) string manipulation");
  console.log("  • Structural sharing reduces memory usage");
  console.log("  • Chunked storage improves cache locality");
  console.log("  • Persistent updates enable undo/redo efficiently");

  console.log("\n7. CATEGORICAL APPLICATIONS");
  
  console.log("Rope applications in fp-oneoff:");
  console.log("  • Rewrite rule traces: Efficient logging of optimization steps");
  console.log("  • Proof derivations: Large proof trees with fast manipulation");
  console.log("  • Source code transformation: AST manipulation with sharing");
  console.log("  • Documentation generation: Large text assembly with performance");
  console.log("  • Error message accumulation: Efficient collection and formatting");

  console.log("\n" + "=".repeat(80));
  console.log("ROPE FEATURES:");
  console.log("✓ O(1) concatenation of large text structures");
  console.log("✓ O(log n) insertion and slicing operations");
  console.log("✓ Persistent with structural sharing");
  console.log("✓ Chunked storage for cache efficiency");
  console.log("✓ Monoidal measures for flexible indexing");
  console.log("✓ Text editing operations with performance guarantees");
  console.log("=".repeat(80));
}

demo();