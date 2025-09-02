// optics-rewrite-demo.ts
// Comprehensive demonstration of optics-driven program rewriting
// Shows the complete pipeline from AST construction to optimization

import { 
  lit, v, add, mul, let_, show, applyRulesFix, applyRulesWithTrace,
  defaultRules, defaultRegistry, Rule, _Add, _Mul, _Let, Term
} from "../types/optics-rewrite.js";

console.log("=".repeat(80));
console.log("COMPREHENSIVE OPTICS REWRITING DEMO");
console.log("=".repeat(80));

console.log("\n1. BASIC PROGRAM CONSTRUCTION");

// Build a complex program with optimization opportunities
const program1 = add(
  mul(lit(1), add(lit(2), lit(3))),         // 1 * (2+3) -> should become 5
  let_("x", mul(lit(0), v("y")), v("x"))    // let x = (0*y) in x -> should become 0
);

console.log("Original program:", show(program1));

console.log("\n2. STEP-BY-STEP OPTIMIZATION");

const trace1 = applyRulesWithTrace(program1, defaultRules);
console.log("Optimization trace:");
for (const step of trace1.steps) {
  console.log(`  ${step.rule}: ${step.before}`);
  console.log(`    → ${step.after}`);
}
console.log(`Converged after ${trace1.iterations} iterations`);
console.log("Final result:", show(trace1.result));

console.log("\n" + "-".repeat(60));

console.log("\n3. SELECTIVE RULE APPLICATION");

const program2 = mul(
  add(lit(0), v("x")),    // 0 + x -> x
  add(lit(1), lit(1))     // 1 + 1 -> 2
);

console.log("Test program:", show(program2));

// Apply only folding rules
const foldOnly = defaultRegistry.applyRules(program2, ["fold/add"]);
console.log("Folding only:", show(foldOnly));

// Apply only peephole rules  
const peepholeOnly = defaultRegistry.applyRules(program2, ["add/zero"]);
console.log("Peephole only:", show(peepholeOnly));

// Apply all rules
const fullOpt = defaultRegistry.applyRules(program2);
console.log("Full optimization:", show(fullOpt));

console.log("\n" + "-".repeat(60));

console.log("\n4. CUSTOM RULE DEVELOPMENT");

// Create a custom rule for algebraic simplification
const distributeRule: Rule = {
  name: "distribute/mul-add",
  optic: _Mul,
  step: (t) => {
    if (t._tag !== "Impure") return t;
    const n = t.node;
    if (n.tag === "Mul" && n.right._tag === "Impure" && n.right.node.tag === "Add") {
      // a * (b + c) -> (a * b) + (a * c)
      const a = n.left;
      const b = n.right.node.left;
      const c = n.right.node.right;
      return add(mul(a, b), mul(a, c));
    }
    return t;
  }
};

// Test distribution
const testDistribute = mul(v("a"), add(lit(2), lit(3)));
console.log("Before distribution:", show(testDistribute));

const distributed = distributeRule.optic.modify(testDistribute, distributeRule.step);
console.log("After distribution:", show(distributed));

// Register and apply with folding
defaultRegistry.register(distributeRule);
const fullyOptimized = defaultRegistry.applyRules(testDistribute);
console.log("Distributed + folded:", show(fullyOptimized));

console.log("\n" + "-".repeat(60));

console.log("\n5. COMPLEX NESTED OPTIMIZATION");

const nested = let_("a", add(lit(1), lit(2)),          // let a = 1+2 in
  let_("b", mul(v("a"), lit(1)),                       //   let b = a*1 in  
    add(v("b"), mul(lit(0), v("c")))                   //     b + 0*c
  )
);

console.log("Nested program:", show(nested));
console.log("(Should optimize to: let a = 3 in let b = a in b, then further to 3)");

const nestedTrace = applyRulesWithTrace(nested, defaultRules);
console.log("\nNested optimization trace:");
for (const step of nestedTrace.steps) {
  console.log(`  ${step.rule}:`);
  console.log(`    ${step.before}`);
  console.log(`    → ${step.after}`);
}
console.log("Final nested result:", show(nestedTrace.result));

console.log("\n" + "-".repeat(60));

console.log("\n6. REWRITE ENGINE ANALYSIS");

// Analyze the rewrite process
const stats = {
  originalSize: countNodes(program1),
  optimizedSize: countNodes(trace1.result),
  rulesApplied: trace1.steps.length,
  uniqueRules: new Set(trace1.steps.map(s => s.rule)).size
};

console.log("Optimization statistics:");
console.log(`  Original AST nodes: ${stats.originalSize}`);
console.log(`  Optimized AST nodes: ${stats.optimizedSize}`);
console.log(`  Reduction: ${((1 - stats.optimizedSize/stats.originalSize) * 100).toFixed(1)}%`);
console.log(`  Rules applied: ${stats.rulesApplied}`);
console.log(`  Unique rules used: ${stats.uniqueRules}`);

console.log("\n" + "=".repeat(80));
console.log("OPTICS REWRITING ACHIEVEMENTS:");
console.log("✓ Profunctor optics for lawful AST manipulation");
console.log("✓ Self-prisms for pattern matching and transformation");
console.log("✓ Rule registry with modular optimization strategies");
console.log("✓ Trace generation for debugging and analysis");
console.log("✓ Fixpoint rewriting with guaranteed termination");
console.log("✓ Integration hooks for existing optics infrastructure");
console.log("✓ Complex nested optimization with multiple passes");
console.log("=".repeat(80));

console.log("\n🎯 PROGRAM OPTIMIZATION APPLICATIONS:");
console.log("• Compiler optimization passes via rewrite rules");
console.log("• DSL transformation and normalization");
console.log("• Algebraic simplification and constant propagation");
console.log("• Dead code elimination and inlining");
console.log("• Custom optimization strategies via rule composition");
}

// Helper function to count AST nodes
function countNodes(t: Term): number {
  if (t._tag === "Pure") return 1;
  if (t._tag !== "Impure") return 1;
  const n = t.node;
  switch (n.tag) {
    case "Lit":
    case "Var":
      return 1;
    case "Add":
    case "Mul":
      return 1 + countNodes(n.left) + countNodes(n.right);
    case "Let":
      return 1 + countNodes(n.bound) + countNodes(n.body);
    default:
      return 1;
  }
}

// Run demo if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('optics-rewrite-demo')) {
  demo();
}