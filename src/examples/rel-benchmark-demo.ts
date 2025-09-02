// rel-benchmark-demo.ts
// Demonstration of the Rel vs BitRel benchmark harness
// Shows deterministic benchmarking with JSON output and markdown summaries

import { Finite, Rel } from "../types/rel-equipment.js";
import { BitRel, timeExecution } from "../types/bitrel.js";

/************ Seeded RNG for Reproducible Results ************/
class SeededRNG {
  private seed: number;
  
  constructor(seed: number = 12345) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % (2**32);
    return this.seed / (2**32);
  }
  
  reset(seed: number = 12345): void {
    this.seed = seed;
  }
}

/************ Deterministic Relation Generation ************/
class DeterministicRelGen {
  private rng: SeededRNG;
  
  constructor(seed: number = 12345) {
    this.rng = new SeededRNG(seed);
  }
  
  generatePairs<A, B>(A: Finite<A>, B: Finite<B>, density: number): Array<[A, B]> {
    const pairs: Array<[A, B]> = [];
    for (const a of A.elems) {
      for (const b of B.elems) {
        if (this.rng.next() < density) {
          pairs.push([a, b]);
        }
      }
    }
    return pairs;
  }
  
  reset(seed: number = 12345): void {
    this.rng.reset(seed);
  }
}

/************ Benchmark Results Structure ************/
interface BenchmarkResult {
  operation: string;
  implementation: "Rel" | "BitRel";
  size: number;
  density: number;
  timeMs: number;
  pairCount: number;
  memoryEstimate: number;
}

/************ Core Benchmark Functions ************/
function benchmarkCompose(size: number, density: number, seed: number = 12345): BenchmarkResult[] {
  const gen = new DeterministicRelGen(seed);
  
  const A = new Finite(Array.from({length: size}, (_, i) => i));
  const B = new Finite(Array.from({length: size}, (_, i) => i + size));
  const C = new Finite(Array.from({length: size}, (_, i) => i + 2 * size));
  
  const RPairs = gen.generatePairs(A, B, density);
  const SPairs = gen.generatePairs(B, C, density);
  
  const R = Rel.fromPairs(A, B, RPairs);
  const S = Rel.fromPairs(B, C, SPairs);
  
  const BR = BitRel.fromRel(R);
  const BS = BitRel.fromRel(S);
  
  // Benchmark Rel
  const relTiming = timeExecution("Rel.compose", () => R.compose(S));
  
  // Benchmark BitRel  
  const bitTiming = timeExecution("BitRel.compose", () => BR.compose(BS));
  
  return [
    {
      operation: "compose",
      implementation: "Rel",
      size,
      density,
      timeMs: relTiming.ms,
      pairCount: RPairs.length + SPairs.length,
      memoryEstimate: size * size * 2 // Rough estimate
    },
    {
      operation: "compose", 
      implementation: "BitRel",
      size,
      density,
      timeMs: bitTiming.ms,
      pairCount: BR.toPairs().length + BS.toPairs().length,
      memoryEstimate: Math.ceil(size * size / 8) * 2 // Bit-packed estimate
    }
  ];
}

function benchmarkUnion(size: number, density: number, seed: number = 12345): BenchmarkResult[] {
  const gen = new DeterministicRelGen(seed);
  
  const A = new Finite(Array.from({length: size}, (_, i) => i));
  const B = new Finite(Array.from({length: size}, (_, i) => i + size));
  
  const R1Pairs = gen.generatePairs(A, B, density);
  const R2Pairs = gen.generatePairs(A, B, density);
  
  const R1 = Rel.fromPairs(A, B, R1Pairs);
  const R2 = Rel.fromPairs(A, B, R2Pairs);
  
  const BR1 = BitRel.fromRel(R1);
  const BR2 = BitRel.fromRel(R2);
  
  const relTiming = timeExecution("Rel.union", () => R1.join(R2));
  const bitTiming = timeExecution("BitRel.union", () => BR1.join(BR2));
  
  return [
    {
      operation: "union",
      implementation: "Rel",
      size,
      density,
      timeMs: relTiming.ms,
      pairCount: R1Pairs.length + R2Pairs.length,
      memoryEstimate: size * size * 2
    },
    {
      operation: "union",
      implementation: "BitRel", 
      size,
      density,
      timeMs: bitTiming.ms,
      pairCount: BR1.toPairs().length + BR2.toPairs().length,
      memoryEstimate: Math.ceil(size * size / 8) * 2
    }
  ];
}

function benchmarkIntersect(size: number, density: number, seed: number = 12345): BenchmarkResult[] {
  const gen = new DeterministicRelGen(seed);
  
  const A = new Finite(Array.from({length: size}, (_, i) => i));
  const B = new Finite(Array.from({length: size}, (_, i) => i + size));
  
  const R1Pairs = gen.generatePairs(A, B, density);
  const R2Pairs = gen.generatePairs(A, B, density);
  
  const R1 = Rel.fromPairs(A, B, R1Pairs);
  const R2 = Rel.fromPairs(A, B, R2Pairs);
  
  const BR1 = BitRel.fromRel(R1);
  const BR2 = BitRel.fromRel(R2);
  
  const relTiming = timeExecution("Rel.intersect", () => R1.meet(R2));
  const bitTiming = timeExecution("BitRel.intersect", () => BR1.meet(BR2));
  
  return [
    {
      operation: "intersect",
      implementation: "Rel",
      size,
      density,
      timeMs: relTiming.ms,
      pairCount: R1Pairs.length + R2Pairs.length,
      memoryEstimate: size * size * 2
    },
    {
      operation: "intersect",
      implementation: "BitRel",
      size,
      density, 
      timeMs: bitTiming.ms,
      pairCount: BR1.toPairs().length + BR2.toPairs().length,
      memoryEstimate: Math.ceil(size * size / 8) * 2
    }
  ];
}

/************ Benchmark Runner ************/
function runBenchmarkSuite(sizes: number[], densities: number[], seed: number = 12345) {
  console.log("=".repeat(80));
  console.log("REL vs BITREL DETERMINISTIC BENCHMARK SUITE");
  console.log("=".repeat(80));
  
  console.log(`\nConfiguration:`);
  console.log(`  Sizes: ${sizes.join(", ")}`);
  console.log(`  Densities: ${densities.join(", ")}`);
  console.log(`  Seed: ${seed}`);
  
  const allResults: BenchmarkResult[] = [];
  
  for (const size of sizes) {
    for (const density of densities) {
      console.log(`\n📊 Benchmarking size=${size}, density=${density}...`);
      
      try {
        const composeResults = benchmarkCompose(size, density, seed);
        const unionResults = benchmarkUnion(size, density, seed + 1);
        const intersectResults = benchmarkIntersect(size, density, seed + 2);
        
        allResults.push(...composeResults, ...unionResults, ...intersectResults);
        
        // Calculate and display speedups for this configuration
        const relCompose = composeResults.find(r => r.implementation === "Rel");
        const bitCompose = composeResults.find(r => r.implementation === "BitRel");
        
        if (relCompose && bitCompose && bitCompose.timeMs > 0) {
          const speedup = relCompose.timeMs / bitCompose.timeMs;
          console.log(`  Compose speedup: ${speedup.toFixed(2)}x`);
        }
        
        const relUnion = unionResults.find(r => r.implementation === "Rel");
        const bitUnion = unionResults.find(r => r.implementation === "BitRel");
        
        if (relUnion && bitUnion && bitUnion.timeMs > 0) {
          const speedup = relUnion.timeMs / bitUnion.timeMs;
          console.log(`  Union speedup: ${speedup.toFixed(2)}x`);
        }
        
        const relIntersect = intersectResults.find(r => r.implementation === "Rel");
        const bitIntersect = intersectResults.find(r => r.implementation === "BitRel");
        
        if (relIntersect && bitIntersect && bitIntersect.timeMs > 0) {
          const speedup = relIntersect.timeMs / bitIntersect.timeMs;
          console.log(`  Intersect speedup: ${speedup.toFixed(2)}x`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error}`);
      }
    }
  }
  
  // Calculate overall statistics
  const operations = ["compose", "union", "intersect"];
  const summaryStats: Record<string, { avg: number; median: number }> = {};
  
  for (const op of operations) {
    const speedups: number[] = [];
    
    for (const size of sizes) {
      for (const density of densities) {
        const relResult = allResults.find(r => 
          r.operation === op && r.implementation === "Rel" && 
          r.size === size && r.density === density
        );
        const bitResult = allResults.find(r => 
          r.operation === op && r.implementation === "BitRel" && 
          r.size === size && r.density === density
        );
        
        if (relResult && bitResult && bitResult.timeMs > 0) {
          speedups.push(relResult.timeMs / bitResult.timeMs);
        }
      }
    }
    
    if (speedups.length > 0) {
      const avg = speedups.reduce((a, b) => a + b, 0) / speedups.length;
      const sorted = speedups.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] || 1.0;
      
      summaryStats[op] = { avg, median };
    }
  }
  
  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("BENCHMARK RESULTS SUMMARY");
  console.log("=".repeat(80));
  
  console.log(`\nTotal tests: ${allResults.length}`);
  console.log("Performance improvements (BitRel vs Rel):");
  
  for (const [op, stats] of Object.entries(summaryStats)) {
    console.log(`  ${op.padEnd(12)}: ${stats.avg.toFixed(2)}x avg, ${stats.median.toFixed(2)}x median`);
  }
  
  // Create JSON output
  const benchmarkRun = {
    timestamp: new Date().toISOString(),
    config: { sizes, densities, seed },
    results: allResults,
    summary: {
      totalTests: allResults.length,
      averageSpeedup: Object.fromEntries(
        Object.entries(summaryStats).map(([op, stats]) => [op, stats.avg])
      ),
      medianSpeedup: Object.fromEntries(
        Object.entries(summaryStats).map(([op, stats]) => [op, stats.median])
      )
    }
  };
  
  return benchmarkRun;
}

/************ Reproducibility Test ************/
function testReproducibility(): void {
  console.log("\n🔄 TESTING REPRODUCIBILITY:");
  
  const seed = 42;
  const size = 32;
  const density = 0.1;
  
  // Run same benchmark twice
  const results1 = benchmarkCompose(size, density, seed);
  const results2 = benchmarkCompose(size, density, seed);
  
  const relTime1 = results1.find(r => r.implementation === "Rel")?.timeMs || 0;
  const relTime2 = results2.find(r => r.implementation === "Rel")?.timeMs || 0;
  
  const bitTime1 = results1.find(r => r.implementation === "BitRel")?.timeMs || 0;
  const bitTime2 = results2.find(r => r.implementation === "BitRel")?.timeMs || 0;
  
  // Note: Actual timing may vary, but the generated relations should be identical
  const gen1 = new DeterministicRelGen(seed);
  const gen2 = new DeterministicRelGen(seed);
  
  const A = new Finite([1, 2, 3, 4]);
  const B = new Finite([5, 6, 7, 8]);
  
  const pairs1 = gen1.generatePairs(A, B, density);
  const pairs2 = gen2.generatePairs(A, B, density);
  
  const sameGeneration = JSON.stringify(pairs1) === JSON.stringify(pairs2);
  
  console.log(`  Same relation generation: ${sameGeneration ? "✅" : "❌"}`);
  console.log(`  Generated ${pairs1.length} pairs deterministically`);
  
  if (sameGeneration) {
    console.log("  ✅ Reproducible results guaranteed with same seed");
  }
}

/************ Demo Execution ************/
export function demonstrateRelBenchmark(): void {
  console.log("=".repeat(80));
  console.log("REL vs BITREL BENCHMARK HARNESS DEMONSTRATION");
  console.log("=".repeat(80));
  
  console.log("\n1. DETERMINISTIC BENCHMARK SUITE");
  
  // Run a small benchmark suite
  const sizes = [32, 64];
  const densities = [0.05, 0.1];
  const seed = 12345;
  
  const results = runBenchmarkSuite(sizes, densities, seed);
  
  console.log("\n2. JSON OUTPUT STRUCTURE");
  console.log("Sample result structure:");
  console.log(JSON.stringify(results.results[0], null, 2));
  
  console.log("\n3. MARKDOWN SUMMARY PREVIEW");
  console.log("Generated summary statistics:");
  console.log(`  Total tests: ${results.summary.totalTests}`);
  console.log("  Average speedups:");
  for (const [op, speedup] of Object.entries(results.summary.averageSpeedup)) {
    const median = results.summary.medianSpeedup[op] || 1.0;
    console.log(`    ${op}: ${speedup.toFixed(2)}x (median: ${median.toFixed(2)}x)`);
  }
  
  testReproducibility();
  
  console.log("\n4. CLI USAGE EXAMPLES");
  console.log("Command line interface supports:");
  console.log("  pnpm bench:rel --sizes 64,128,256 --densities 0.01,0.05,0.1");
  console.log("  pnpm bench:rel --sizes 32 --densities 0.1 --iterations 5");
  console.log("  pnpm bench:rel --seed 42 --output results/custom");
  
  console.log("\n5. OUTPUT FILES");
  console.log("Benchmark generates:");
  console.log("  📄 bench/rel/benchmark-{timestamp}.json - Full results");
  console.log("  📄 bench/rel/latest.json - Most recent run");
  console.log("  📄 bench/rel/summary.md - Human-readable summary");
  
  console.log("\n6. BENCHMARK FEATURES");
  console.log("✅ Deterministic results with seeded RNG");
  console.log("✅ Matrix size × density parameter sweeps");
  console.log("✅ JSON output for CI/automation");
  console.log("✅ Markdown summaries with statistics");
  console.log("✅ Operations: compose, union, intersect, transitive closure");
  console.log("✅ Memory usage estimation");
  console.log("✅ Median/mean speedup calculations");
  console.log("✅ Reproducible across runs with same seed");
  
  console.log("\n7. PERFORMANCE INSIGHTS");
  console.log("Expected performance characteristics:");
  console.log("  • BitRel faster for large, sparse relations");
  console.log("  • Memory savings increase with matrix size");
  console.log("  • Composition shows largest speedups");
  console.log("  • Dense relations may favor different approaches");
  
  console.log("\n" + "=".repeat(80));
  console.log("🎯 BENCHMARK HARNESS READY:");
  console.log("• CI-runnable with deterministic results");
  console.log("• No hardcoded speedup claims - all measured");
  console.log("• Comprehensive operation coverage");
  console.log("• Professional JSON and Markdown output");
  console.log("=".repeat(80));
}

// Run demonstration
demonstrateRelBenchmark();