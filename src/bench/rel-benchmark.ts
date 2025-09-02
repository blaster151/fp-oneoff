// rel-benchmark.ts
// Deterministic benchmark harness for Rel vs BitRel performance comparison
// CLI: pnpm bench:rel --sizes 64,128,256 --densities 0.01,0.05,0.1

import { Finite, Rel } from "../types/rel-equipment.js";
import { BitRel } from "../types/bitrel.js";
import * as fs from "fs";
import * as path from "path";

/************ Seeded Random Number Generator ************/
class SeededRNG {
  private seed: number;
  
  constructor(seed: number = 12345) {
    this.seed = seed;
  }
  
  // Linear congruential generator for deterministic results
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % (2**32);
    return this.seed / (2**32);
  }
  
  // Reset to initial seed for reproducibility
  reset(seed: number = 12345): void {
    this.seed = seed;
  }
}

/************ Benchmark Configuration ************/
export interface BenchmarkConfig {
  sizes: number[];
  densities: number[];
  iterations: number;
  seed: number;
  outputDir: string;
}

export interface OperationResult {
  operation: string;
  implementation: "Rel" | "BitRel";
  size: number;
  density: number;
  timeMs: number;
  memoryBytes?: number;
  pairCount: number;
}

export interface BenchmarkRun {
  timestamp: string;
  config: BenchmarkConfig;
  results: OperationResult[];
  summary: {
    totalTests: number;
    averageSpeedup: Record<string, number>;
    medianSpeedup: Record<string, number>;
  };
}

/************ Deterministic Data Generation ************/
export class RelationGenerator {
  private rng: SeededRNG;
  
  constructor(seed: number = 12345) {
    this.rng = new SeededRNG(seed);
  }
  
  reset(seed: number = 12345): void {
    this.rng.reset(seed);
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
  
  generateRel<A, B>(A: Finite<A>, B: Finite<B>, density: number): Rel<A, B> {
    const pairs = this.generatePairs(A, B, density);
    return Rel.fromPairs(A, B, pairs);
  }
  
  generateBitRel<A, B>(A: Finite<A>, B: Finite<B>, density: number): BitRel<A, B> {
    const pairs = this.generatePairs(A, B, density);
    return BitRel.fromPairs(A, B, pairs);
  }
}

/************ High-Resolution Timing ************/
export function timeOperation<T>(operation: () => T): { result: T; timeMs: number } {
  const start = typeof performance !== "undefined" && performance.now ? 
    performance.now() : Date.now();
  
  const result = operation();
  
  const end = typeof performance !== "undefined" && performance.now ? 
    performance.now() : Date.now();
  
  return { result, timeMs: end - start };
}

/************ Memory Usage Estimation ************/
export function estimateMemoryUsage(rel: Rel<any, any> | BitRel<any, any>): number {
  if (rel instanceof BitRel) {
    // BitRel: Uint32Array storage
    const rows = (rel as any).A.elems.length;
    const cols = (rel as any).B.elems.length;
    const wordsPerRow = Math.ceil(cols / 32);
    return rows * wordsPerRow * 4; // 4 bytes per Uint32
  } else {
    // Rel: boolean[][] storage
    const rows = rel.A.elems.length;
    const cols = rel.B.elems.length;
    return rows * cols; // Approximate: 1 byte per boolean
  }
}

/************ Transitive Closure Implementation ************/
export function transitiveClosure<T>(R: Rel<T, T>): Rel<T, T> {
  if (R.A !== R.B) throw new Error("Transitive closure requires square relation");
  
  let current = R;
  let changed = true;
  
  while (changed) {
    const next = current.join(current.compose(current));
    changed = !relationsEqual(current, next);
    current = next;
  }
  
  return current;
}

export function transitiveClosureBit<T>(R: BitRel<T, T>): BitRel<T, T> {
  if (R.A !== R.B) throw new Error("Transitive closure requires square relation");
  
  let current = R;
  let changed = true;
  
  while (changed) {
    const next = current.join(current.compose(current));
    changed = !bitRelationsEqual(current, next);
    current = next;
  }
  
  return current;
}

function relationsEqual<A, B>(r1: Rel<A, B>, r2: Rel<A, B>): boolean {
  if (r1.A !== r2.A || r1.B !== r2.B) return false;
  
  for (let i = 0; i < r1.A.elems.length; i++) {
    for (let j = 0; j < r1.B.elems.length; j++) {
      if (r1.mat[i]![j] !== r2.mat[i]![j]) return false;
    }
  }
  return true;
}

function bitRelationsEqual<A, B>(r1: BitRel<A, B>, r2: BitRel<A, B>): boolean {
  const pairs1 = new Set(r1.toPairs().map(p => JSON.stringify(p)));
  const pairs2 = new Set(r2.toPairs().map(p => JSON.stringify(p)));
  
  return pairs1.size === pairs2.size && 
    Array.from(pairs1).every(p => pairs2.has(p));
}

/************ Core Benchmark Operations ************/
export class RelBenchmark {
  private generator: RelationGenerator;
  private results: OperationResult[] = [];
  
  constructor(seed: number = 12345) {
    this.generator = new RelationGenerator(seed);
  }
  
  benchmarkCompose(size: number, density: number, iterations: number = 3): OperationResult[] {
    const results: OperationResult[] = [];
    
    for (let iter = 0; iter < iterations; iter++) {
      this.generator.reset(12345 + iter); // Different seed per iteration
      
      const A = new Finite(Array.from({length: size}, (_, i) => i));
      const B = new Finite(Array.from({length: size}, (_, i) => i + size));
      const C = new Finite(Array.from({length: size}, (_, i) => i + 2 * size));
      
      const R = this.generator.generateRel(A, B, density);
      const S = this.generator.generateRel(B, C, density);
      
      const BR = BitRel.fromRel(R);
      const BS = BitRel.fromRel(S);
      
      // Benchmark Rel composition
      const relTiming = timeOperation(() => R.compose(S));
      results.push({
        operation: "compose",
        implementation: "Rel",
        size,
        density,
        timeMs: relTiming.timeMs,
        memoryBytes: estimateMemoryUsage(R) + estimateMemoryUsage(S),
        pairCount: R.toPairs().length + S.toPairs().length
      });
      
      // Benchmark BitRel composition
      const bitTiming = timeOperation(() => BR.compose(BS));
      results.push({
        operation: "compose",
        implementation: "BitRel",
        size,
        density,
        timeMs: bitTiming.timeMs,
        memoryBytes: estimateMemoryUsage(BR) + estimateMemoryUsage(BS),
        pairCount: BR.toPairs().length + BS.toPairs().length
      });
    }
    
    return results;
  }
  
  benchmarkUnion(size: number, density: number, iterations: number = 3): OperationResult[] {
    const results: OperationResult[] = [];
    
    for (let iter = 0; iter < iterations; iter++) {
      this.generator.reset(12345 + iter);
      
      const A = new Finite(Array.from({length: size}, (_, i) => i));
      const B = new Finite(Array.from({length: size}, (_, i) => i + size));
      
      const R1 = this.generator.generateRel(A, B, density);
      const R2 = this.generator.generateRel(A, B, density);
      
      const BR1 = BitRel.fromRel(R1);
      const BR2 = BitRel.fromRel(R2);
      
      // Benchmark Rel union (join)
      const relTiming = timeOperation(() => R1.join(R2));
      results.push({
        operation: "union",
        implementation: "Rel",
        size,
        density,
        timeMs: relTiming.timeMs,
        memoryBytes: estimateMemoryUsage(R1) + estimateMemoryUsage(R2),
        pairCount: R1.toPairs().length + R2.toPairs().length
      });
      
      // Benchmark BitRel union (join)
      const bitTiming = timeOperation(() => BR1.join(BR2));
      results.push({
        operation: "union",
        implementation: "BitRel",
        size,
        density,
        timeMs: bitTiming.timeMs,
        memoryBytes: estimateMemoryUsage(BR1) + estimateMemoryUsage(BR2),
        pairCount: BR1.toPairs().length + BR2.toPairs().length
      });
    }
    
    return results;
  }
  
  benchmarkIntersect(size: number, density: number, iterations: number = 3): OperationResult[] {
    const results: OperationResult[] = [];
    
    for (let iter = 0; iter < iterations; iter++) {
      this.generator.reset(12345 + iter);
      
      const A = new Finite(Array.from({length: size}, (_, i) => i));
      const B = new Finite(Array.from({length: size}, (_, i) => i + size));
      
      const R1 = this.generator.generateRel(A, B, density);
      const R2 = this.generator.generateRel(A, B, density);
      
      const BR1 = BitRel.fromRel(R1);
      const BR2 = BitRel.fromRel(R2);
      
      // Benchmark Rel intersection (meet)
      const relTiming = timeOperation(() => R1.meet(R2));
      results.push({
        operation: "intersect",
        implementation: "Rel",
        size,
        density,
        timeMs: relTiming.timeMs,
        memoryBytes: estimateMemoryUsage(R1) + estimateMemoryUsage(R2),
        pairCount: R1.toPairs().length + R2.toPairs().length
      });
      
      // Benchmark BitRel intersection (meet)
      const bitTiming = timeOperation(() => BR1.meet(BR2));
      results.push({
        operation: "intersect",
        implementation: "BitRel",
        size,
        density,
        timeMs: bitTiming.timeMs,
        memoryBytes: estimateMemoryUsage(BR1) + estimateMemoryUsage(BR2),
        pairCount: BR1.toPairs().length + BR2.toPairs().length
      });
    }
    
    return results;
  }
  
  benchmarkTransitiveClosure(size: number, density: number, iterations: number = 3): OperationResult[] {
    const results: OperationResult[] = [];
    
    // Limit size for transitive closure to avoid exponential blowup
    const maxSize = Math.min(size, 64);
    const limitedDensity = Math.min(density, 0.1); // Limit density for TC
    
    for (let iter = 0; iter < iterations; iter++) {
      this.generator.reset(12345 + iter);
      
      const A = new Finite(Array.from({length: maxSize}, (_, i) => i));
      
      const R = this.generator.generateRel(A, A, limitedDensity);
      const BR = BitRel.fromRel(R);
      
      // Benchmark Rel transitive closure
      try {
        const relTiming = timeOperation(() => transitiveClosure(R));
        results.push({
          operation: "transitive_closure",
          implementation: "Rel",
          size: maxSize,
          density: limitedDensity,
          timeMs: relTiming.timeMs,
          memoryBytes: estimateMemoryUsage(R),
          pairCount: R.toPairs().length
        });
      } catch (e) {
        // Skip if too expensive
      }
      
      // Benchmark BitRel transitive closure
      try {
        const bitTiming = timeOperation(() => transitiveClosureBit(BR));
        results.push({
          operation: "transitive_closure",
          implementation: "BitRel",
          size: maxSize,
          density: limitedDensity,
          timeMs: bitTiming.timeMs,
          memoryBytes: estimateMemoryUsage(BR),
          pairCount: BR.toPairs().length
        });
      } catch (e) {
        // Skip if too expensive
      }
    }
    
    return results;
  }
  
  runFullBenchmark(config: BenchmarkConfig): BenchmarkRun {
    console.log("Starting comprehensive Rel vs BitRel benchmark...");
    console.log(`Sizes: ${config.sizes.join(", ")}`);
    console.log(`Densities: ${config.densities.join(", ")}`);
    console.log(`Iterations per test: ${config.iterations}`);
    
    const allResults: OperationResult[] = [];
    
    for (const size of config.sizes) {
      for (const density of config.densities) {
        console.log(`\nBenchmarking size=${size}, density=${density}...`);
        
        // Run all operations
        const composeResults = this.benchmarkCompose(size, density, config.iterations);
        const unionResults = this.benchmarkUnion(size, density, config.iterations);
        const intersectResults = this.benchmarkIntersect(size, density, config.iterations);
        const tcResults = this.benchmarkTransitiveClosure(size, density, config.iterations);
        
        allResults.push(...composeResults, ...unionResults, ...intersectResults, ...tcResults);
      }
    }
    
    // Calculate summary statistics
    const summary = this.calculateSummary(allResults);
    
    const benchmarkRun: BenchmarkRun = {
      timestamp: new Date().toISOString(),
      config,
      results: allResults,
      summary
    };
    
    return benchmarkRun;
  }
  
  private calculateSummary(results: OperationResult[]): BenchmarkRun["summary"] {
    const operations = ["compose", "union", "intersect", "transitive_closure"];
    const averageSpeedup: Record<string, number> = {};
    const medianSpeedup: Record<string, number> = {};
    
    for (const op of operations) {
      const opResults = results.filter(r => r.operation === op);
      const speedups = this.calculateSpeedups(opResults);
      
      if (speedups.length > 0) {
        averageSpeedup[op] = speedups.reduce((a, b) => a + b, 0) / speedups.length;
        medianSpeedup[op] = this.median(speedups);
      } else {
        averageSpeedup[op] = 1.0;
        medianSpeedup[op] = 1.0;
      }
    }
    
    return {
      totalTests: results.length,
      averageSpeedup,
      medianSpeedup
    };
  }
  
  private calculateSpeedups(results: OperationResult[]): number[] {
    const speedups: number[] = [];
    
    // Group by size and density
    const groups = new Map<string, OperationResult[]>();
    for (const result of results) {
      const key = `${result.size}-${result.density}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(result);
    }
    
    for (const [, group] of groups) {
      const relResults = group.filter(r => r.implementation === "Rel");
      const bitResults = group.filter(r => r.implementation === "BitRel");
      
      if (relResults.length > 0 && bitResults.length > 0) {
        const avgRelTime = relResults.reduce((sum, r) => sum + r.timeMs, 0) / relResults.length;
        const avgBitTime = bitResults.reduce((sum, r) => sum + r.timeMs, 0) / bitResults.length;
        
        if (avgBitTime > 0) {
          speedups.push(avgRelTime / avgBitTime);
        }
      }
    }
    
    return speedups;
  }
  
  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1]! + sorted[mid]!) / 2 
      : sorted[mid]!;
  }
}