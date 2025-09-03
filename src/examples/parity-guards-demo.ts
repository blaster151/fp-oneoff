// parity-guards-demo.ts
// Demonstration of Rel/BitRel parity guards with strategy-awareness
// Shows how differential testing catches implementation bugs immediately

import { 
  demonstrateParityGuards, configureParityChecking, initParityChecking,
  InstrumentedRel, runParityTests, createParityTestData,
  checkCompositionParity, checkUnionParity, checkIntersectionParity
} from "../types/rel-parity-guards.js";
import { Finite, Rel } from "../types/rel-equipment.js";
import { BitRel } from "../types/bitrel.js";
import { printLawCheck, errorText, successText, warningText } from "../types/display-helpers.js";

console.log("=".repeat(80));
console.log("REL/BITREL STRATEGY-AWARENESS GUARDRAILS");
console.log("=".repeat(80));

export function demonstrateStrategyAwareness(): void {
  
  console.log("\n1. ENVIRONMENT VARIABLE CONTROL");
  
  // Show current configuration
  console.log("🔧 Current parity checking status:");
  const envVar = process.env.REL_PARITY_CHECK;
  console.log(`  REL_PARITY_CHECK: ${envVar || "(not set)"}`);
  
  if (envVar === "1") {
    console.log(successText("  ✅ Parity checking enabled via environment"));
  } else {
    console.log(warningText("  ⚠️ Parity checking disabled"));
    console.log("  To enable: export REL_PARITY_CHECK=1");
  }
  
  console.log("\n2. ENABLING FOR DEMONSTRATION");
  
  // Enable parity checking for demo
  configureParityChecking({
    enabled: true,
    sampleProbability: 1.0, // Check all operations
    crashOnMismatch: false, // Don't crash during demo
    logSuccesses: true,
    maxInputSize: 50
  });
  
  console.log(successText("✅ Parity checking enabled for demonstration"));
  console.log("  Sample probability: 100% (all operations checked)");
  console.log("  Crash on mismatch: disabled (for demo safety)");
  
  console.log("\n3. SUCCESSFUL PARITY CHECKS");
  
  // Test with data that should pass
  const A = new Finite([1, 2, 3]);
  const B = new Finite(['a', 'b', 'c']);
  const C = new Finite(['x', 'y', 'z']);
  
  const R = Rel.fromPairs(A, B, [[1, 'a'], [2, 'b'], [3, 'c']]);
  const S = Rel.fromPairs(B, C, [['a', 'x'], ['b', 'y'], ['c', 'z']]);
  
  console.log("🔍 Testing composition parity:");
  const composeCheck = checkCompositionParity(R, S);
  if (composeCheck) {
    printLawCheck("Compose parity", composeCheck);
  }
  
  console.log("\n🔍 Testing union parity:");
  const R2 = Rel.fromPairs(A, B, [[1, 'b'], [3, 'a']]);
  const unionCheck = checkUnionParity(R, R2);
  if (unionCheck) {
    printLawCheck("Union parity", unionCheck);
  }
  
  console.log("\n🔍 Testing intersection parity:");
  const intersectCheck = checkIntersectionParity(R, R2);
  if (intersectCheck) {
    printLawCheck("Intersection parity", intersectCheck);
  }
  
  console.log("\n4. INSTRUMENTED OPERATIONS");
  
  // Test instrumented operations that automatically check parity
  console.log("🔧 Testing instrumented relation operations:");
  
  const instrR = InstrumentedRel.fromPairs(A, B, [[1, 'a'], [2, 'b']]);
  const instrS = InstrumentedRel.fromPairs(B, C, [['a', 'x'], ['b', 'y']]);
  
  try {
    console.log("  Creating instrumented relations...");
    
    const composed = instrR.compose(instrS);
    console.log(`  ✅ Compose: ${composed.toPairs().length} pairs`);
    
    const union = instrR.join(InstrumentedRel.fromPairs(A, B, [[3, 'c']]));
    console.log(`  ✅ Union: ${union.toPairs().length} pairs`);
    
    const converse = instrR.converse();
    console.log(`  ✅ Converse: ${converse.toPairs().length} pairs`);
    
    const stats = InstrumentedRel.getStats();
    console.log(`  Operations performed: ${stats.operationCount}`);
    
  } catch (error) {
    console.log(`  ${errorText("❌ Parity mismatch detected:")} ${error.message}`);
  }
  
  console.log("\n5. SIMULATED BUG DETECTION");
  
  // Simulate what happens when there's a real bug
  console.log("🐛 Simulating implementation bug:");
  
  // Create a mock BitRel that produces wrong results
  const mockBrokenBitRel = {
    fromRel: (rel: Rel<any, any>) => ({
      compose: (other: any) => ({
        toPairs: () => [[999, 'bug']] // Wrong result!
      }),
      toPairs: () => rel.toPairs()
    })
  };
  
  console.log("  Simulated bug: BitRel.compose returns [[999, 'bug']] instead of correct result");
  console.log("  Expected behavior: Fast crash with exact differing pairs");
  
  // Show what the error output would look like
  console.log("\n  Simulated crash output:");
  console.log(errorText("  🚨 PARITY MISMATCH DETECTED 🚨"));
  console.log(errorText("  Operation: compose"));
  console.log(errorText("  ❌ EXACT DIFFERING PAIRS:"));
  console.log("    Rel-only pairs: [[1, 'x'], [2, 'y']]");
  console.log("    BitRel-only pairs: [[999, 'bug']]");
  console.log(errorText("  💥 IMPLEMENTATION BUG DETECTED"));
  
  console.log("\n6. CONFIGURATION OPTIONS");
  
  console.log("🔧 Environment variable configuration:");
  console.log("  REL_PARITY_CHECK=1           # Enable parity checking");
  console.log("  REL_PARITY_PROBABILITY=0.2   # Check 20% of operations");
  console.log("  REL_PARITY_MAX_SIZE=50       # Limit input size");
  console.log("  REL_PARITY_CRASH=false       # Don't crash on mismatch");
  console.log("  REL_PARITY_VERBOSE=true      # Log successful checks");
  
  console.log("\n7. DEVELOPMENT WORKFLOW");
  
  console.log("💻 Recommended development workflow:");
  console.log("  1. Set REL_PARITY_CHECK=1 during development");
  console.log("  2. Run tests and examples normally");
  console.log("  3. Parity guards automatically catch backend mismatches");
  console.log("  4. Fast crash with exact differing pairs for debugging");
  console.log("  5. Fix implementation bug and continue");
  
  console.log("\n8. PERFORMANCE IMPACT");
  
  console.log("⚡ Performance characteristics:");
  console.log("  • Sampling: Only checks subset of operations (configurable %)");
  console.log("  • Size limits: Skips large inputs to avoid overhead");
  console.log("  • Fast comparison: Set-based diff algorithm");
  console.log("  • Fail fast: Immediate crash prevents corruption propagation");
  
  console.log("\n" + "=".repeat(80));
  console.log("PARITY GUARDS ACHIEVEMENTS:");
  console.log("✓ Environment variable control (REL_PARITY_CHECK=1)");
  console.log("✓ Random sampling of operations for checking");
  console.log("✓ Fast crash on mismatch with exact differing pairs");
  console.log("✓ Comprehensive witness information");
  console.log("✓ Configurable checking probability and limits");
  console.log("✓ Instrumented relation operations");
  console.log("✓ Development-friendly error reporting");
  console.log("=".repeat(80));
  
  console.log("\n🎯 STRATEGY-AWARENESS BENEFITS:");
  console.log("• Immediate bug detection across backend implementations");
  console.log("• Exact failure location with differing pairs");
  console.log("• Configurable overhead for different development phases");
  console.log("• Fast failure prevents silent corruption");
  console.log("• Enhanced confidence in implementation correctness");
}

// Run the demonstration
demonstrateStrategyAwareness();

// Also run the comprehensive parity guards demo
console.log("\n" + "=".repeat(80));
console.log("RUNNING COMPREHENSIVE PARITY GUARDS DEMO");
console.log("=".repeat(80));
demonstrateParityGuards();