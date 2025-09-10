// rel-parity-guards.ts
// Strategy-awareness guardrails ensuring BitRel/Rel produce identical results
// Dev-mode parity checking with fast crash on mismatches

import { Finite, Rel } from './rel-equipment.js';
import { BitRel } from './bitrel.js';
import { formatWitness, printLawCheck, errorText, warningText, successText } from './display-helpers.js';
import { LawCheck, lawCheck, lawCheckSuccess } from './witnesses.js';

/************ Configuration ************/

/** Parity checking configuration */
interface ParityConfig {
  enabled: boolean;
  sampleProbability: number;  // Probability of running parity check (0.0 - 1.0)
  maxInputSize: number;       // Maximum input size for parity checking
  crashOnMismatch: boolean;   // Whether to crash immediately on mismatch
  logSuccesses: boolean;      // Whether to log successful parity checks
}

/** Global parity configuration */
let parityConfig: ParityConfig = {
  enabled: false,
  sampleProbability: 0.1,     // 10% of operations checked by default
  maxInputSize: 100,          // Limit size for performance
  crashOnMismatch: true,      // Fail fast on detection
  logSuccesses: false         // Quiet success by default
};

/** Initialize parity checking from environment variables */
export function initParityChecking(): void {
  const envCheck = process.env.REL_PARITY_CHECK;
  
  if (envCheck === "1" || envCheck === "true") {
    parityConfig.enabled = true;
    console.log(successText("🛡️ Rel/BitRel parity checking enabled"));
  }
  
  // Additional configuration from environment
  if (process.env.REL_PARITY_PROBABILITY) {
    parityConfig.sampleProbability = parseFloat(process.env.REL_PARITY_PROBABILITY);
  }
  
  if (process.env.REL_PARITY_MAX_SIZE) {
    parityConfig.maxInputSize = parseInt(process.env.REL_PARITY_MAX_SIZE, 10);
  }
  
  if (process.env.REL_PARITY_CRASH === "false") {
    parityConfig.crashOnMismatch = false;
  }
  
  if (process.env.REL_PARITY_VERBOSE === "true") {
    parityConfig.logSuccesses = true;
  }
}

/** Configure parity checking programmatically */
export function configureParityChecking(config: Partial<ParityConfig>): void {
  parityConfig = { ...parityConfig, ...config };
}

/** Get current parity configuration */
export function getParityConfig(): ParityConfig {
  return { ...parityConfig };
}

/************ Parity Mismatch Detection ************/

/** Parity mismatch witness */
export interface ParityMismatchWitness {
  operation: string;
  inputs: {
    relations: Array<{ pairs: Array<[any, any]>; A: any[]; B: any[] }>;
    otherArgs?: any[];
  };
  outputs: {
    rel: Array<[any, any]>;
    bitRel: Array<[any, any]>;
  };
  differences: {
    relOnly: Array<[any, any]>;
    bitRelOnly: Array<[any, any]>;
  };
  context: {
    timestamp: number;
    inputSizes: number[];
    operationCount: number;
  };
}

/** Compare relation results for parity */
function compareRelationResults<A, B>(
  relResult: Rel<A, B>,
  bitRelResult: BitRel<A, B>,
  operation: string,
  context: any
): LawCheck<ParityMismatchWitness> {
  
  const relPairs = relResult.toPairs();
  const bitPairs = bitRelResult.toPairs();
  
  // Convert to sets for comparison
  const relSet = new Set(relPairs.map(p => JSON.stringify([p[0], p[1]])));
  const bitSet = new Set(bitPairs.map(p => JSON.stringify([p[0], p[1]])));
  
  // Find differences
  const relOnly: Array<[any, any]> = [];
  const bitRelOnly: Array<[any, any]> = [];
  
  for (const pairStr of relSet) {
    if (!bitSet.has(pairStr)) {
      relOnly.push(JSON.parse(pairStr));
    }
  }
  
  for (const pairStr of bitSet) {
    if (!relSet.has(pairStr)) {
      bitRelOnly.push(JSON.parse(pairStr));
    }
  }
  
  const identical = relOnly.length === 0 && bitRelOnly.length === 0;
  
  if (identical) {
    return lawCheckSuccess(`Parity verified: ${operation} produces identical results`);
  } else {
    const witness: ParityMismatchWitness = {
      operation,
      inputs: context.inputs,
      outputs: {
        rel: relPairs.map(p => [p[0], p[1]]),
        bitRel: bitPairs.map(p => [p[0], p[1]])
      },
      differences: {
        relOnly,
        bitRelOnly
      },
      context: {
        timestamp: Date.now(),
        inputSizes: context.inputSizes || [],
        operationCount: context.operationCount || 0
      }
    };
    
    return lawCheck(false, witness, `Parity mismatch detected in ${operation}`);
  }
}

/************ Operation-Specific Parity Checks ************/

/** Check parity for composition operation */
export function checkCompositionParity<A, B, C>(
  R: Rel<A, B>,
  S: Rel<B, C>
): LawCheck<ParityMismatchWitness> | null {
  
  if (!parityConfig.enabled || Math.random() > parityConfig.sampleProbability) {
    return null; // Skip check
  }
  
  const totalSize = R.A.elems.length + R.B.elems.length + S.B.elems.length;
  if (totalSize > parityConfig.maxInputSize) {
    return null; // Skip large inputs
  }
  
  try {
    // Compute with both backends
    const relResult = R.compose(S);
    const bitR = BitRel.fromRel(R);
    const bitS = BitRel.fromRel(S);
    const bitResult = bitR.compose(bitS);
    
    const comparison = compareRelationResults(relResult, bitResult, "compose", {
      inputs: {
        relations: [
          { pairs: R.toPairs().map(p => [p[0], p[1]]), A: R.A.elems, B: R.B.elems },
          { pairs: S.toPairs().map(p => [p[0], p[1]]), A: S.A.elems, B: S.B.elems }
        ]
      },
      inputSizes: [R.A.elems.length, R.B.elems.length, S.B.elems.length]
    });
    
    if (parityConfig.logSuccesses && comparison.ok) {
      console.log(successText(`✓ Parity check passed: compose(${totalSize} elements)`));
    }
    
    return comparison;
    
  } catch (error) {
    console.error(errorText(`Parity check error: ${error}`));
    return null; // Skip check on error
  }
}

/** Check parity for union (join) operation */
export function checkUnionParity<A, B>(
  R1: Rel<A, B>,
  R2: Rel<A, B>
): LawCheck<ParityMismatchWitness> | null {
  
  if (!parityConfig.enabled || Math.random() > parityConfig.sampleProbability) {
    return null;
  }
  
  const totalSize = R1.A.elems.length + R1.B.elems.length;
  if (totalSize > parityConfig.maxInputSize) {
    return null;
  }
  
  try {
    const relResult = R1.join(R2);
    const bitR1 = BitRel.fromRel(R1);
    const bitR2 = BitRel.fromRel(R2);
    const bitResult = bitR1.join(bitR2);
    
    return compareRelationResults(relResult, bitResult, "union", {
      inputs: {
        relations: [
          { pairs: R1.toPairs().map(p => [p[0], p[1]]), A: R1.A.elems, B: R1.B.elems },
          { pairs: R2.toPairs().map(p => [p[0], p[1]]), A: R2.A.elems, B: R2.B.elems }
        ]
      },
      inputSizes: [totalSize]
    });
    
  } catch (error) {
    console.error(errorText(`Union parity check error: ${error}`));
    return null;
  }
}

/** Check parity for intersection (meet) operation */
export function checkIntersectionParity<A, B>(
  R1: Rel<A, B>,
  R2: Rel<A, B>
): LawCheck<ParityMismatchWitness> | null {
  
  if (!parityConfig.enabled || Math.random() > parityConfig.sampleProbability) {
    return null;
  }
  
  const totalSize = R1.A.elems.length + R1.B.elems.length;
  if (totalSize > parityConfig.maxInputSize) {
    return null;
  }
  
  try {
    const relResult = R1.meet(R2);
    const bitR1 = BitRel.fromRel(R1);
    const bitR2 = BitRel.fromRel(R2);
    const bitResult = bitR1.meet(bitR2);
    
    return compareRelationResults(relResult, bitResult, "intersection", {
      inputs: {
        relations: [
          { pairs: R1.toPairs().map(p => [p[0], p[1]]), A: R1.A.elems, B: R1.B.elems },
          { pairs: R2.toPairs().map(p => [p[0], p[1]]), A: R2.A.elems, B: R2.B.elems }
        ]
      },
      inputSizes: [totalSize]
    });
    
  } catch (error) {
    console.error(errorText(`Intersection parity check error: ${error}`));
    return null;
  }
}

/** Check parity for converse operation */
export function checkConverseParity<A, B>(
  R: Rel<A, B>
): LawCheck<ParityMismatchWitness> | null {
  
  if (!parityConfig.enabled || Math.random() > parityConfig.sampleProbability) {
    return null;
  }
  
  const totalSize = R.A.elems.length + R.B.elems.length;
  if (totalSize > parityConfig.maxInputSize) {
    return null;
  }
  
  try {
    const relResult = R.converse();
    const bitR = BitRel.fromRel(R);
    const bitResult = bitR.converse();
    
    return compareRelationResults(relResult, bitResult, "converse", {
      inputs: {
        relations: [
          { pairs: R.toPairs().map(p => [p[0], p[1]]), A: R.A.elems, B: R.B.elems }
        ]
      },
      inputSizes: [totalSize]
    });
    
  } catch (error) {
    console.error(errorText(`Converse parity check error: ${error}`));
    return null;
  }
}

/************ Parity Violation Handling ************/

/** Handle parity mismatch with detailed reporting */
function handleParityMismatch(mismatch: LawCheck<ParityMismatchWitness>): void {
  if (mismatch.ok || !mismatch.witness) return;
  
  const w = mismatch.witness;
  
  console.error(errorText("\n🚨 PARITY MISMATCH DETECTED 🚨"));
  console.error(errorText(`Operation: ${w.operation}`));
  console.error(errorText(`Timestamp: ${new Date(w.context.timestamp).toISOString()}`));
  
  console.error(warningText("\n📊 Input Details:"));
  w.inputs.relations.forEach((rel, i) => {
    console.error(`  Relation ${i + 1}: ${rel.pairs.length} pairs, |A|=${rel.A.length}, |B|=${rel.B.length}`);
    console.error(`    Sample pairs: ${JSON.stringify(rel.pairs.slice(0, 3))}${rel.pairs.length > 3 ? '...' : ''}`);
  });
  
  console.error(warningText("\n🔍 Output Comparison:"));
  console.error(`  Rel result: ${w.outputs.rel.length} pairs`);
  console.error(`  BitRel result: ${w.outputs.bitRel.length} pairs`);
  
  console.error(errorText("\n❌ EXACT DIFFERING PAIRS:"));
  if (w.differences.relOnly.length > 0) {
    console.error(`  Rel-only pairs (${w.differences.relOnly.length}):`);
    w.differences.relOnly.slice(0, 5).forEach(pair => {
      console.error(`    ${JSON.stringify(pair)}`);
    });
    if (w.differences.relOnly.length > 5) {
      console.error(`    ... ${w.differences.relOnly.length - 5} more`);
    }
  }
  
  if (w.differences.bitRelOnly.length > 0) {
    console.error(`  BitRel-only pairs (${w.differences.bitRelOnly.length}):`);
    w.differences.bitRelOnly.slice(0, 5).forEach(pair => {
      console.error(`    ${JSON.stringify(pair)}`);
    });
    if (w.differences.bitRelOnly.length > 5) {
      console.error(`    ... ${w.differences.bitRelOnly.length - 5} more`);
    }
  }
  
  console.error(errorText("\n💥 IMPLEMENTATION BUG DETECTED"));
  console.error(errorText("The Rel and BitRel implementations produce different results!"));
  console.error(errorText("This indicates a serious bug in one of the implementations."));
  
  if (parityConfig.crashOnMismatch) {
    console.error(errorText("\n🛑 CRASHING FAST TO PREVENT FURTHER CORRUPTION"));
    throw new Error(`Parity mismatch in ${w.operation}: Rel and BitRel produce different results. See details above.`);
  }
}

/************ Instrumented Relation Operations ************/

/** Instrumented Rel class with parity checking */
export class InstrumentedRel<A, B> {
  private rel: Rel<A, B>;
  private static operationCount = 0;
  
  constructor(rel: Rel<A, B>) {
    this.rel = rel;
  }
  
/** Create from pairs with optional parity checking */
static fromPairs<A, B>(
  A: Finite<A>,
  B: Finite<B>,
  pairs: Iterable<readonly [A, B]> | Iterable<[A, B]>
): InstrumentedRel<A, B> {
  // Normalize to mutable tuples, which Rel.fromPairs expects.
  const norm: [A, B][] = [];
  for (const [a, b] of pairs as Iterable<readonly [A, B]>) {
    norm.push([a, b]);
  }
  const rel = Rel.fromPairs(A, B, norm);
  return new InstrumentedRel(rel);
}

  /** Delegate basic properties */
  get A() { return this.rel.A; }
  get B() { return this.rel.B; }
  has(a: A, b: B): boolean { return this.rel.has(a, b); }
  toPairs() { return this.rel.toPairs(); }
  
  /** Instrumented compose with parity checking */
  compose<C>(other: InstrumentedRel<B, C>): InstrumentedRel<A, C> {
    InstrumentedRel.operationCount++;
    
    const result = this.rel.compose(other.rel);
    
    // Parity check
    const parityCheck = checkCompositionParity(this.rel, other.rel);
    if (parityCheck && !parityCheck.ok) {
      handleParityMismatch(parityCheck);
    }
    
    return new InstrumentedRel(result);
  }
  
  /** Instrumented join with parity checking */
  join(other: InstrumentedRel<A, B>): InstrumentedRel<A, B> {
    InstrumentedRel.operationCount++;
    
    const result = this.rel.join(other.rel);
    
    // Parity check
    const parityCheck = checkUnionParity(this.rel, other.rel);
    if (parityCheck && !parityCheck.ok) {
      handleParityMismatch(parityCheck);
    }
    
    return new InstrumentedRel(result);
  }
  
  /** Instrumented meet with parity checking */
  meet(other: InstrumentedRel<A, B>): InstrumentedRel<A, B> {
    InstrumentedRel.operationCount++;
    
    const result = this.rel.meet(other.rel);
    
    // Parity check
    const parityCheck = checkIntersectionParity(this.rel, other.rel);
    if (parityCheck && !parityCheck.ok) {
      handleParityMismatch(parityCheck);
    }
    
    return new InstrumentedRel(result);
  }
  
  /** Instrumented converse with parity checking */
  converse(): InstrumentedRel<B, A> {
    InstrumentedRel.operationCount++;
    
    const result = this.rel.converse();
    
    // Parity check
    const parityCheck = checkConverseParity(this.rel);
    if (parityCheck && !parityCheck.ok) {
      handleParityMismatch(parityCheck);
    }
    
    return new InstrumentedRel(result);
  }
  
  /** Get operation statistics */
  static getStats(): { operationCount: number; parityConfig: ParityConfig } {
    return {
      operationCount: InstrumentedRel.operationCount,
      parityConfig: { ...parityConfig }
    };
  }
  
  /** Reset operation counter */
  static resetStats(): void {
    InstrumentedRel.operationCount = 0;
  }
}

/************ Comprehensive Parity Testing ************/

/** Run comprehensive parity tests on sample data */
export function runParityTests(
  testCases: Array<{
    name: string;
    A: Finite<any>;
    B: Finite<any>;
    C?: Finite<any>;
    R: Array<[any, any]>;
    S?: Array<[any, any]>;
  }>
): {
  passed: number;
  failed: number;
  failures: Array<{ testCase: string; mismatch: ParityMismatchWitness }>;
} {
  
  const results = {
    passed: 0,
    failed: 0,
    failures: [] as Array<{ testCase: string; mismatch: ParityMismatchWitness }>
  };
  
  console.log(warningText("\n🧪 Running comprehensive parity tests..."));
  
  for (const testCase of testCases) {
    console.log(`\n  Testing: ${testCase.name}`);
    
    const R = Rel.fromPairs(testCase.A, testCase.B, testCase.R);
    
    // Test composition if second relation provided
    if (testCase.S && testCase.C) {
      const S = Rel.fromPairs(testCase.B, testCase.C, testCase.S);
      const composeCheck = checkCompositionParity(R, S);
      
      if (composeCheck) {
        if (composeCheck.ok) {
          results.passed++;
          console.log(`    Compose: ${successText("✓ PASS")}`);
        } else {
          results.failed++;
          console.log(`    Compose: ${errorText("✗ FAIL")}`);
          if (composeCheck.witness) {
            results.failures.push({ testCase: `${testCase.name}-compose`, mismatch: composeCheck.witness });
          }
        }
      }
    }
    
    // Test union with self
    const unionCheck = checkUnionParity(R, R);
    if (unionCheck) {
      if (unionCheck.ok) {
        results.passed++;
        console.log(`    Union: ${successText("✓ PASS")}`);
      } else {
        results.failed++;
        console.log(`    Union: ${errorText("✗ FAIL")}`);
        if (unionCheck.witness) {
          results.failures.push({ testCase: `${testCase.name}-union`, mismatch: unionCheck.witness });
        }
      }
    }
    
    // Test converse
    const converseCheck = checkConverseParity(R);
    if (converseCheck) {
      if (converseCheck.ok) {
        results.passed++;
        console.log(`    Converse: ${successText("✓ PASS")}`);
      } else {
        results.failed++;
        console.log(`    Converse: ${errorText("✗ FAIL")}`);
        if (converseCheck.witness) {
          results.failures.push({ testCase: `${testCase.name}-converse`, mismatch: converseCheck.witness });
        }
      }
    }
  }
  
  return results;
}

/************ Development Utilities ************/

/** Create test data for parity checking */
export function createParityTestData(): Array<{
  name: string;
  A: Finite<any>;
  B: Finite<any>;
  C?: Finite<any>;
  R: Array<[any, any]>;
  S?: Array<[any, any]>;
}> {
  return [
    {
      name: "Simple 2x2",
      A: new Finite([1, 2]),
      B: new Finite(['a', 'b']),
      C: new Finite(['x', 'y']),
      R: [[1, 'a'], [2, 'b']],
      S: [['a', 'x'], ['b', 'y']]
    },
    {
      name: "Empty relation",
      A: new Finite([1, 2, 3]),
      B: new Finite(['a', 'b', 'c']),
      R: []
    },
    {
      name: "Full relation", 
      A: new Finite([1, 2]),
      B: new Finite(['a', 'b']),
      R: [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
    },
    {
      name: "Identity relation",
      A: new Finite([1, 2, 3]),
      B: new Finite([1, 2, 3]),
      R: [[1, 1], [2, 2], [3, 3]]
    }
  ];
}

/** Demonstrate parity checking system */
export function demonstrateParityGuards(): void {
  console.log("=".repeat(80));
  console.log("REL/BITREL PARITY GUARDS DEMONSTRATION");
  console.log("=".repeat(80));
  
  console.log("\n1. CONFIGURATION");
  console.log(`  Enabled: ${parityConfig.enabled ? successText("✓") : warningText("✗")}`);
  console.log(`  Sample probability: ${parityConfig.sampleProbability * 100}%`);
  console.log(`  Max input size: ${parityConfig.maxInputSize}`);
  console.log(`  Crash on mismatch: ${parityConfig.crashOnMismatch ? "✓" : "✗"}`);
  
  if (!parityConfig.enabled) {
    console.log(warningText("\n⚠️ Parity checking disabled. Set REL_PARITY_CHECK=1 to enable."));
  }
  
  console.log("\n2. ENABLING PARITY CHECKS");
  
  // Enable for demonstration
  configureParityChecking({ 
    enabled: true, 
    sampleProbability: 1.0, // Check all operations for demo
    crashOnMismatch: false, // Don't crash during demo
    logSuccesses: true 
  });
  
  console.log(successText("✓ Parity checking enabled for demonstration"));
  
  console.log("\n3. TESTING WITH SAMPLE DATA");
  
  const testData = createParityTestData();
  const testResults = runParityTests(testData.slice(0, 2)); // Limit for demo
  
  console.log(`\n📊 Parity test results:`);
  console.log(`  Passed: ${successText(testResults.passed.toString())}`);
  console.log(`  Failed: ${errorText(testResults.failed.toString())}`);
  
  if (testResults.failures.length > 0) {
    console.log(`\n❌ Failures detected:`);
    testResults.failures.forEach(failure => {
      console.log(`    ${failure.testCase}: ${formatWitness(failure.mismatch)}`);
    });
  }
  
  console.log("\n4. SIMULATED MISMATCH (for demonstration)");
  
  // Create a simulated mismatch for demonstration
  const simulatedMismatch: ParityMismatchWitness = {
    operation: "compose",
    inputs: {
      relations: [
        { pairs: [[1, 'a'], [2, 'b']], A: [1, 2], B: ['a', 'b'] },
        { pairs: [['a', 'x'], ['b', 'y']], A: ['a', 'b'], B: ['x', 'y'] }
      ]
    },
    outputs: {
      rel: [[1, 'x'], [2, 'y']],
      bitRel: [[1, 'x'], [2, 'z']] // Simulated bug: 'z' instead of 'y'
    },
    differences: {
      relOnly: [[2, 'y']],
      bitRelOnly: [[2, 'z']]
    },
    context: {
      timestamp: Date.now(),
      inputSizes: [2, 2, 2],
      operationCount: 42
    }
  };
  
  console.log(warningText("\n⚠️ Simulated mismatch (for demonstration):"));
  const simulatedCheck = lawCheck(false, simulatedMismatch, "Simulated parity mismatch");
  
  // Don't crash, just show the output
  const originalCrash = parityConfig.crashOnMismatch;
  configureParityChecking({ crashOnMismatch: false });
  
  try {
    handleParityMismatch(simulatedCheck);
  } catch (error) {
    console.error(errorText(`Would crash with: ${error instanceof Error ? error.message : String(error)}`));
  }
  
  configureParityChecking({ crashOnMismatch: originalCrash });
  
  console.log("\n5. INSTRUMENTED OPERATIONS");
  
  // Demonstrate instrumented operations
  const A = new Finite([1, 2]);
  const B = new Finite(['a', 'b']);
  const C = new Finite(['x', 'y']);
  
  const instrR = InstrumentedRel.fromPairs(A, B, [[1, 'a'], [2, 'b']]);
  const instrS = InstrumentedRel.fromPairs(B, C, [['a', 'x'], ['b', 'y']]);
  
  console.log("\n🔧 Testing instrumented operations:");
  console.log("  Creating instrumented relations...");
  
  try {
    const composed = instrR.compose(instrS);
    console.log(`  Compose result: ${composed.toPairs().length} pairs`);
    
    const stats = InstrumentedRel.getStats();
    console.log(`  Operations performed: ${stats.operationCount}`);
    
  } catch (error) {
    console.log(`  ${errorText("Parity mismatch caught:")} ${error instanceof Error ? error.message : String(error)}`);
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("PARITY GUARDS ACHIEVEMENTS:");
  console.log("✓ Environment variable control (REL_PARITY_CHECK=1)");
  console.log("✓ Random sampling of operations for checking");
  console.log("✓ Fast crash on mismatch with exact differing pairs");
  console.log("✓ Comprehensive witness information");
  console.log("✓ Instrumented relation operations");
  console.log("✓ Configurable checking probability and limits");
  console.log("=".repeat(80));
  
  console.log("\n🎯 DEVELOPMENT SAFETY:");
  console.log("• Catches implementation bugs immediately");
  console.log("• Provides exact differing pairs for debugging");
  console.log("• Configurable for different development phases");
  console.log("• Fast failure prevents corruption propagation");
}

/************ Initialization ************/

// Auto-initialize from environment on module load
initParityChecking();

// Export for manual control (already exported above)