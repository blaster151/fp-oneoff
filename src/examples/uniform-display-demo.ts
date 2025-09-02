// uniform-display-demo.ts
// Demonstration of uniform error/display helpers across all domains
// Shows consistent formatting for relations, optics, monads, homology

import { 
  formatWitness, printLawCheck, printLawCheckGroup, printLawCheckSummary,
  formatMonadLaws, formatEMMonoidLaws, formatOpticsLaws, formatRelationalLaws,
  formatBenchmarkResults, formatHomologyResults, demonstrateDisplayHelpers,
  configureDisplay, autoConfigureDisplay
} from "../types/display-helpers.js";
import { lawCheck, LawCheck } from "../types/witnesses.js";

console.log("=".repeat(80));
console.log("UNIFORM DISPLAY HELPERS ACROSS ALL DOMAINS");
console.log("=".repeat(80));

export function demonstrateUniformDisplay(): void {
  
  console.log("\n1. CONSISTENT LAW CHECK FORMATTING");
  
  // Monad law examples
  const monadLaws = {
    leftUnit: lawCheck(true, undefined, "chain(of(a), k) = k(a) verified"),
    rightUnit: lawCheck(true, undefined, "chain(m, of) = m verified"),
    associativity: lawCheck(false, {
      input: 42,
      leftSide: { tag: "some", value: 43 },
      rightSide: { tag: "some", value: 42 }
    }, "Associativity violation detected")
  };
  
  formatMonadLaws(monadLaws);
  
  // EM-monoid law examples
  const emLaws = {
    monoidLaws: lawCheck(true, undefined, "Associativity and unit verified"),
    algebraUnit: lawCheck(false, {
      input: 5,
      expected: 5,
      actual: 6
    }, "alg(of(a)) ≠ a"),
    multiplicativity: lawCheck(true, undefined, "Multiplicativity verified"),
    unitMorphism: lawCheck(true, undefined, "Unit morphism verified")
  };
  
  formatEMMonoidLaws(emLaws);
  
  // Optics law examples
  const opticsLaws = {
    getSet: lawCheck(true, undefined, "get-set law verified"),
    setGet: lawCheck(false, {
      s: { name: "Alice", age: 30 },
      a: 25,
      got: 26
    }, "set-get law violated"),
    setSet: lawCheck(true, undefined, "set-set law verified")
  };
  
  formatOpticsLaws(opticsLaws);
  
  console.log("\n2. RELATIONAL LAW FORMATTING");
  
  const relationalLaws = {
    "Residual Adjunctions": [
      lawCheck(true, undefined, "Left adjunction verified"),
      lawCheck(true, undefined, "Right adjunction verified"),
      lawCheck(false, {
        R: [[1, 'a'], [2, 'b']],
        X: [['a', 'x'], ['b', 'y']], 
        S: [[1, 'x']],
        violatingPair: [2, 'y']
      }, "Adjunction failed")
    ],
    "Transformer Laws": [
      lawCheck(true, undefined, "wp/sp adjunction verified"),
      lawCheck(true, undefined, "Composition verified")
    ]
  };
  
  formatRelationalLaws(relationalLaws);
  
  console.log("\n3. BENCHMARK RESULT FORMATTING");
  
  const benchmarkResults = [
    { operation: "compose", size: 64, density: 0.1, relTime: 12.5, bitTime: 3.2, speedup: 3.9 },
    { operation: "union", size: 64, density: 0.1, relTime: 8.1, bitTime: 2.1, speedup: 3.9 },
    { operation: "intersect", size: 128, density: 0.05, relTime: 15.2, bitTime: 4.8, speedup: 3.2 },
    { operation: "compose", size: 256, density: 0.01, relTime: 45.1, bitTime: 12.3, speedup: 3.7 }
  ];
  
  formatBenchmarkResults(benchmarkResults);
  
  console.log("\n4. HOMOLOGY RESULT FORMATTING");
  
  const homologyResults = [
    { dimension: 0, rank: 1, torsion: [], prettyForm: "ℤ" },
    { dimension: 1, rank: 2, torsion: [], prettyForm: "ℤ²" },
    { dimension: 2, rank: 0, torsion: [2], prettyForm: "ℤ/2" },
    { dimension: 3, rank: 1, torsion: [3, 5], prettyForm: "ℤ ⊕ ℤ/3 ⊕ ℤ/5" }
  ];
  
  formatHomologyResults(homologyResults);
  
  console.log("\n5. TRUNCATION AND SHOW MORE");
  
  // Large witness example
  const largeWitness = {
    operation: "complex-operation",
    inputs: Array.from({length: 20}, (_, i) => `input${i}`),
    metadata: {
      timestamp: Date.now(),
      version: "1.0.0",
      config: {
        enabled: true,
        options: Array.from({length: 15}, (_, i) => `option${i}`),
        nested: {
          deep: {
            values: Array.from({length: 25}, (_, i) => i)
          }
        }
      }
    },
    errors: Array.from({length: 10}, (_, i) => `error${i}`)
  };
  
  console.log("\n📊 Large witness formatting:");
  printLawCheck("Complex failure", lawCheck(false, largeWitness, "Large payload demonstration"));
  
  console.log("\n6. ENVIRONMENT-SPECIFIC CONFIGURATION");
  
  console.log("\n🔧 Testing CI configuration:");
  // Simulate CI environment
  const originalEnv = process.env.CI;
  process.env.CI = "true";
  autoConfigureDisplay();
  
  printLawCheck("CI-formatted result", lawCheck(false, { simple: "witness" }, "CI environment test"));
  
  // Restore environment
  if (originalEnv) {
    process.env.CI = originalEnv;
  } else {
    delete process.env.CI;
  }
  
  // Reset to defaults
  configureDisplay({ colorEnabled: true, maxWitnessLength: 200 });
  
  console.log("\n7. CONSISTENCY VERIFICATION");
  
  // Verify that all domains use the same formatting
  const consistencyTests = [
    { domain: "Monad Laws", example: monadLaws.associativity },
    { domain: "EM-Monoid Laws", example: emLaws.algebraUnit },
    { domain: "Optics Laws", example: opticsLaws.setGet },
    { domain: "Relational Laws", example: relationalLaws["Residual Adjunctions"][2] }
  ];
  
  console.log("\nConsistency verification:");
  for (const test of consistencyTests) {
    const formatted = formatWitness(test.example);
    const hasStatusIcon = formatted.includes("✅") || formatted.includes("❌");
    const hasStructure = formatted.length > 10; // Non-trivial formatting
    
    console.log(`  ${test.domain}: ${hasStatusIcon && hasStructure ? "✅" : "❌"} Consistent`);
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("UNIFORM DISPLAY SYSTEM ACHIEVEMENTS:");
  console.log("✓ Consistent formatting across all domains");
  console.log("✓ Colorized output for quick scanning");
  console.log("✓ Smart truncation with show more toggle");
  console.log("✓ Specialized formatters for each law type");
  console.log("✓ Environment-aware configuration (CI support)");
  console.log("✓ Enhanced debugging with structured output");
  console.log("=".repeat(80));
  
  console.log("\n🎯 DEVELOPER EXPERIENCE BENEFITS:");
  console.log("• Quick visual scanning with color coding");
  console.log("• Consistent output format across all examples");
  console.log("• Smart payload management for large witnesses");
  console.log("• Professional appearance for demos and documentation");
}

// Run the demonstration
demonstrateUniformDisplay();

// Also run the comprehensive display helpers demo
console.log("\n" + "=".repeat(80));
console.log("RUNNING COMPREHENSIVE DISPLAY HELPERS DEMO");
console.log("=".repeat(80));
demonstrateDisplayHelpers();