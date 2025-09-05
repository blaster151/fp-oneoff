#!/usr/bin/env ts-node

/**
 * Benchmark comparing traditional while loops vs lfpOmega for fixed point computation.
 */

import { powersetCPO, lfpOmega } from '../../src/order/Domain';

interface BenchmarkResult {
  method: string;
  time: number;
  result: any;
  iterations: number;
}

function benchmarkWhileLoop(universe: string[], initial: string[], maxIterations = 1000): BenchmarkResult {
  const start = performance.now();
  let iterations = 0;
  
  let current = [...initial];
  let changed = true;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    const next = [...current];
    
    // Simple dependency closure: a -> b -> c
    for (const item of current) {
      if (item === "a" && !next.includes("b")) {
        next.push("b");
        changed = true;
      }
      if (item === "b" && !next.includes("c")) {
        next.push("c");
        changed = true;
      }
    }
    
    current = next;
    iterations++;
  }
  
  const time = performance.now() - start;
  return {
    method: 'while-loop',
    time,
    result: current,
    iterations
  };
}

function benchmarkLfpOmega(universe: string[], initial: string[]): BenchmarkResult {
  const start = performance.now();
  
  const C = powersetCPO(universe, (x, y) => x === y);
  
  // Create a function that starts from the initial set, not bottom
  const f = (S: string[]) => {
    // If we're at bottom (empty), start with initial set
    if (S.length === 0) {
      return initial.slice();
    }
    
    const out = S.slice();
    // Same logic as while loop: a -> b -> c
    for (const item of S) {
      if (item === "a" && !out.includes("b")) {
        out.push("b");
      }
      if (item === "b" && !out.includes("c")) {
        out.push("c");
      }
    }
    return out;
  };
  
  const result = lfpOmega(C, f);
  const time = performance.now() - start;
  
  return {
    method: 'lfpOmega',
    time,
    result,
    iterations: 0 // lfpOmega doesn't expose iteration count
  };
}

function runBenchmark(universeSize: number, initialSize: number, reps: number) {
  console.log(`\n🚀 Benchmark: universe size ${universeSize}, initial size ${initialSize}, ${reps} reps\n`);
  
  const universe = Array.from({ length: universeSize }, (_, i) => String.fromCharCode(97 + i));
  const initial = universe.slice(0, initialSize);
  
  const whileResults: number[] = [];
  const lfpResults: number[] = [];
  
  for (let i = 0; i < reps; i++) {
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    const whileResult = benchmarkWhileLoop(universe, initial);
    const lfpResult = benchmarkLfpOmega(universe, initial);
    
    whileResults.push(whileResult.time);
    lfpResults.push(lfpResult.time);
    
    // Verify results are equivalent
    const whileSet = new Set(whileResult.result.sort());
    const lfpSet = new Set(lfpResult.result.sort());
    
    if (whileSet.size !== lfpSet.size || ![...whileSet].every(x => lfpSet.has(x))) {
      console.error('❌ Results mismatch!');
      console.error('While loop result:', whileResult.result);
      console.error('LfpOmega result:', lfpResult.result);
      return;
    }
  }
  
  const whileAvg = whileResults.reduce((a, b) => a + b, 0) / reps;
  const lfpAvg = lfpResults.reduce((a, b) => a + b, 0) / reps;
  
  const whileMin = Math.min(...whileResults);
  const lfpMin = Math.min(...lfpResults);
  
  const whileMax = Math.max(...whileResults);
  const lfpMax = Math.max(...lfpResults);
  
  console.log('📊 Results:');
  console.log(`   While loop: avg ${whileAvg.toFixed(3)}ms, min ${whileMin.toFixed(3)}ms, max ${whileMax.toFixed(3)}ms`);
  console.log(`   LfpOmega:   avg ${lfpAvg.toFixed(3)}ms, min ${lfpMin.toFixed(3)}ms, max ${lfpMax.toFixed(3)}ms`);
  
  const speedup = whileAvg / lfpAvg;
  if (speedup > 1) {
    console.log(`   🏆 LfpOmega is ${speedup.toFixed(2)}x faster`);
  } else {
    console.log(`   🏆 While loop is ${(1/speedup).toFixed(2)}x faster`);
  }
}

function main() {
  const N = parseInt(process.env.N || '10');
  const D = parseFloat(process.env.D || '0.5');
  const REPS = parseInt(process.env.REPS || '10');
  
  console.log('🔬 Domain Theory Performance Benchmark');
  console.log(`   N=${N} (universe size), D=${D} (initial ratio), REPS=${REPS}`);
  
  const initialSize = Math.max(1, Math.floor(N * D));
  
  runBenchmark(N, initialSize, REPS);
  
  console.log('\n💡 To run with different parameters:');
  console.log('   N=14 D=0.2 REPS=15 ts-node scripts/bench/lfpomega_bench.ts');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}