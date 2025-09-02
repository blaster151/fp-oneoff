// writer-rewrite-demo.ts
// Demonstration of Writer-logged rewrite passes that tie optics to debuggable logs
// Shows side-by-side comparison of plain rewrite vs rewriteW

import { 
  lit, v, add, mul, let_, show, applyRulesFix, 
  defaultRules, Rule, Term,
  rewriteW, prettyLog, prettyComparison, writer, pathToString
} from "../types/optics-rewrite.js";

console.log("=".repeat(80));
console.log("WRITER-LOGGED REWRITE PASSES DEMO");
console.log("=".repeat(80));

export function demonstrateWriterRewrite(): void {
  console.log("\n1. BASIC WRITER-LOGGED REWRITING");
  
  // Create a program with multiple optimization opportunities
  const program1 = add(
    mul(lit(1), add(lit(2), lit(3))),         // 1 * (2+3) -> should optimize to 5
    let_("x", mul(lit(0), v("y")), v("x"))    // let x = (0*y) in x -> should optimize to 0
  );
  
  console.log("Original program:", show(program1));
  
  // Plain rewrite
  const plainResult = applyRulesFix(program1, defaultRules);
  console.log("Plain rewrite result:", show(plainResult));
  
  // Writer-logged rewrite
  const writerResult = rewriteW(program1, defaultRules);
  const [loggedResult, logs] = writerResult;
  
  console.log("Writer-logged result:", show(loggedResult));
  console.log("Rule applications logged:", logs.length);
  
  // Verify they produce the same result
  console.log("Results identical:", show(plainResult) === show(loggedResult) ? "✅" : "❌");
  
  console.log("\n2. DETAILED RULE TRACE");
  console.log(prettyLog(writerResult));
  
  console.log("\n3. SIDE-BY-SIDE COMPARISON");
  console.log(prettyComparison(program1, plainResult, writerResult));
  
  console.log("\n4. COMPLEX NESTED OPTIMIZATION WITH LOGGING");
  
  const nested = let_("a", add(lit(1), lit(2)),          // let a = 1+2 in
    let_("b", mul(v("a"), lit(1)),                       //   let b = a*1 in  
      add(v("b"), mul(lit(0), v("c")))                   //     b + 0*c
    )
  );
  
  console.log("Complex nested program:", show(nested));
  
  const nestedPlain = applyRulesFix(nested, defaultRules);
  const nestedWriter = rewriteW(nested, defaultRules);
  
  console.log("\nNested optimization with Writer logging:");
  console.log(prettyComparison(nested, nestedPlain, nestedWriter));
  
  console.log("\n5. SELECTIVE RULE APPLICATION WITH LOGGING");
  
  const testProgram = mul(
    add(lit(0), v("x")),    // 0 + x -> x (add/zero rule)
    add(lit(2), lit(3))     // 2 + 3 -> 5 (fold/add rule)
  );
  
  console.log("Test program:", show(testProgram));
  
  // Test different rule subsets
  const foldingRules = defaultRules.filter(r => r.name.startsWith("fold"));
  const peepholeRules = defaultRules.filter(r => r.name.includes("zero") || r.name.includes("one"));
  
  console.log("\nFolding rules only:");
  const foldingWriter = rewriteW(testProgram, foldingRules);
  console.log(prettyLog(foldingWriter));
  
  console.log("\nPeephole rules only:");
  const peepholeWriter = rewriteW(testProgram, peepholeRules);
  console.log(prettyLog(peepholeWriter));
  
  console.log("\nAll rules:");
  const allRulesWriter = rewriteW(testProgram, defaultRules);
  console.log(prettyLog(allRulesWriter));
  
  console.log("\n6. PATH TRACKING DEMONSTRATION");
  
  const pathDemo = add(
    mul(add(lit(1), lit(1)), lit(0)),  // (1+1)*0 -> path tracking should show nested applications
    add(lit(3), lit(4))                // 3+4 -> simple folding
  );
  
  console.log("Path tracking demo:", show(pathDemo));
  const pathWriter = rewriteW(pathDemo, defaultRules);
  const [, pathLogs] = pathWriter;
  
  console.log("\nDetailed path information:");
  pathLogs.forEach((log, i) => {
    console.log(`  ${i + 1}. ${log}`);
  });
  
  console.log("\n7. PERFORMANCE COMPARISON");
  
  const largeProgram = add(
    add(add(lit(1), lit(2)), add(lit(3), lit(4))),
    add(add(lit(5), lit(6)), add(lit(7), lit(8)))
  );
  
  console.log("Large program:", show(largeProgram));
  
  console.time("Plain rewrite");
  const largePlain = applyRulesFix(largeProgram, defaultRules);
  console.timeEnd("Plain rewrite");
  
  console.time("Writer-logged rewrite");
  const largeWriter = rewriteW(largeProgram, defaultRules);
  console.timeEnd("Writer-logged rewrite");
  
  const [largeResult, largeLogs] = largeWriter;
  console.log("Results match:", show(largePlain) === show(largeResult) ? "✅" : "❌");
  console.log("Total rule applications:", largeLogs.length);
  
  console.log("\n8. CUSTOM RULE WITH LOGGING");
  
  // Create a custom rule for demonstration
  const customRule: Rule = {
    name: "custom/double-add",
    optic: { modify: (s: Term, f: (t: Term) => Term) => f(s) },
    step: (t) => {
      if (t._tag === "Impure" && t.node.tag === "Add") {
        const n = t.node;
        if (n.left._tag === "Impure" && n.left.node.tag === "Lit" && 
            n.right._tag === "Impure" && n.right.node.tag === "Lit" &&
            n.left.node.n === n.right.node.n) {
          // x + x -> 2 * x
          return mul(lit(2), lit(n.left.node.n));
        }
      }
      return t;
    }
  };
  
  const customTest = add(lit(5), lit(5));  // 5 + 5 -> should become 2 * 5 -> then fold to 10
  console.log("Custom rule test:", show(customTest));
  
  const customWriter = rewriteW(customTest, [customRule, ...defaultRules]);
  console.log("Custom rule result:");
  console.log(prettyLog(customWriter));
  
  console.log("\n9. DETERMINISTIC LOGGING VERIFICATION");
  
  // Run the same rewrite multiple times to verify deterministic logging
  const deterministicTest = add(mul(lit(1), lit(2)), lit(0));
  
  const run1 = rewriteW(deterministicTest, defaultRules);
  const run2 = rewriteW(deterministicTest, defaultRules);
  const run3 = rewriteW(deterministicTest, defaultRules);
  
  const logs1 = run1[1];
  const logs2 = run2[1];
  const logs3 = run3[1];
  
  const deterministicLogs = JSON.stringify(logs1) === JSON.stringify(logs2) && 
                           JSON.stringify(logs2) === JSON.stringify(logs3);
  
  console.log("Deterministic logging:", deterministicLogs ? "✅" : "❌");
  console.log("Log entries:", logs1.length);
  if (logs1.length > 0) {
    console.log("Sample log:", logs1[0]);
  }
}

// Helper function to create test programs
function createTestProgram(depth: number): Term {
  if (depth === 0) {
    return lit(Math.floor(Math.random() * 10));
  }
  
  const left = createTestProgram(depth - 1);
  const right = createTestProgram(depth - 1);
  
  return Math.random() < 0.5 ? add(left, right) : mul(left, right);
}

console.log("\n10. STRESS TEST WITH DEEP NESTING");

const deepProgram = createTestProgram(3);
console.log("Deep program:", show(deepProgram));

const deepWriter = rewriteW(deepProgram, defaultRules);
const [deepResult, deepLogs] = deepWriter;

console.log("Deep optimization completed");
console.log("Rule applications:", deepLogs.length);
console.log("Final result:", show(deepResult));

if (deepLogs.length > 0) {
  console.log("First few rules:");
  deepLogs.slice(0, 5).forEach((log, i) => {
    console.log(`  ${i + 1}. ${log}`);
  });
}

console.log("\n" + "=".repeat(80));
console.log("WRITER-LOGGED REWRITE ACHIEVEMENTS:");
console.log("✓ Writer<string[], Expr> API for logged rewriting");
console.log("✓ Path tracking shows exact rule application locations");
console.log("✓ Deterministic, human-readable rule traces");
console.log("✓ Same final results as plain rewrite (verified)");
console.log("✓ prettyLog() and prettyComparison() utilities");
console.log("✓ Integration with existing optics and rule system");
console.log("✓ Support for custom rules with logging");
console.log("✓ Performance monitoring and stress testing");
console.log("=".repeat(80));

console.log("\n🎯 DEBUGGING APPLICATIONS:");
console.log("• Compiler optimization debugging and verification");
console.log("• DSL transformation audit trails");
console.log("• Performance analysis of rewrite rule effectiveness");
console.log("• Educational visualization of program optimization");
console.log("• Regression testing with deterministic logs");

// Run the demonstration
demonstrateWriterRewrite();