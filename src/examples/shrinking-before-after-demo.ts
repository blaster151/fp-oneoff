// shrinking-before-after-demo.ts
// Dramatic demonstration of how shrinking transforms debugging experience
// Shows the difference between large opaque payloads and minimal 1-3 element examples

import { applyShrinking, estimateSize, minimizeWitness, shrinkArray, shrinkObject } from "../types/property-shrinking.js";

console.log("=".repeat(80));
console.log("BEFORE vs AFTER: Property-Based Shrinking Impact");
console.log("=".repeat(80));

export function demonstrateBeforeAfter(): void {
  
  console.log("\n📊 SCENARIO 1: Array Property Failure");
  
  // Before: Large opaque array
  const largeFailingArray = [
    1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 
    31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 50  // One even number at the end
  ];
  
  // Property: "must contain an even number"
  const evenPredicate = (arr: number[]) => arr.some(n => n % 2 === 0);
  
  console.log("\n❌ BEFORE shrinking:");
  console.log(`  Failed array length: ${largeFailingArray.length}`);
  console.log(`  Array: [${largeFailingArray.slice(0, 10).join(", ")}...] (truncated)`);
  console.log(`  Size estimate: ${estimateSize(largeFailingArray)}`);
  console.log("  🤔 Hard to see what's causing the failure!");
  
  const shrunkArray = applyShrinking(largeFailingArray, evenPredicate);
  
  console.log("\n✅ AFTER shrinking:");
  console.log(`  Minimal array: [${shrunkArray.join(", ")}]`);
  console.log(`  Length: ${shrunkArray.length}`);
  console.log(`  Size estimate: ${estimateSize(shrunkArray)}`);
  console.log("  🎯 Immediately clear what causes the failure!");
  
  const arrayReduction = ((estimateSize(largeFailingArray) - estimateSize(shrunkArray)) / estimateSize(largeFailingArray) * 100);
  console.log(`  Reduction: ${arrayReduction.toFixed(1)}%`);
  
  console.log("\n📊 SCENARIO 2: Complex Object Property Failure");
  
  // Before: Complex object with deeply nested failure
  const complexFailingObject = {
    requestId: "req_1234567890abcdef",
    timestamp: "2023-12-01T10:30:45.123Z",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    headers: {
      authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      contentType: "application/json",
      acceptLanguage: "en-US,en;q=0.9,es;q=0.8",
      cacheControl: "no-cache, no-store, must-revalidate"
    },
    payload: {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com", roles: ["admin", "user"] },
        { id: 2, name: "Bob", email: "bob@example.com", roles: ["user"] },
        { id: 3, name: "Charlie", email: "charlie@example.com", roles: ["guest"] }
      ],
      metadata: {
        version: "1.2.3",
        environment: "production",
        features: ["feature1", "feature2", "feature3"],
        config: {
          timeout: 30000,
          retries: 3,
          debug: false,
          logging: {
            level: "info",
            destinations: ["console", "file", "remote"],
            format: "json"
          }
        }
      }
    },
    metrics: {
      requestTime: 145.67,
      memoryUsage: 1024768,
      cpuUsage: 23.4
    },
    errors: [],
    warnings: ["deprecated API usage", "slow query detected"]
  };
  
  // Property: "has at least one user with admin role"
  const adminPredicate = (obj: typeof complexFailingObject) => {
    return obj.payload?.users?.some(user => user.roles?.includes("admin")) || false;
  };
  
  console.log("\n❌ BEFORE shrinking:");
  console.log(`  Object has ${Object.keys(complexFailingObject).length} top-level keys`);
  console.log(`  Size estimate: ${estimateSize(complexFailingObject)}`);
  console.log("  JSON (truncated):", JSON.stringify(complexFailingObject).substring(0, 100) + "...");
  console.log("  🤔 Impossible to quickly identify the relevant part!");
  
  const shrunkObject = applyShrinking(complexFailingObject, adminPredicate);
  
  console.log("\n✅ AFTER shrinking:");
  console.log(`  Minimal object: ${JSON.stringify(shrunkObject)}`);
  console.log(`  Size estimate: ${estimateSize(shrunkObject)}`);
  console.log("  🎯 Crystal clear what matters for the property!");
  
  const objectReduction = ((estimateSize(complexFailingObject) - estimateSize(shrunkObject)) / estimateSize(complexFailingObject) * 100);
  console.log(`  Reduction: ${objectReduction.toFixed(1)}%`);
  
  console.log("\n📊 SCENARIO 3: Lens Law Violation");
  
  // Before: Complex lens counterexample
  const complexLensViolation = {
    subject: {
      id: "user_123456789",
      profile: {
        personalInfo: {
          firstName: "Alice",
          lastName: "Johnson-Smith-Williams",
          dateOfBirth: "1990-05-15",
          address: {
            street: "123 Very Long Street Name",
            city: "San Francisco",
            state: "California",
            zipCode: "94102",
            country: "United States"
          }
        },
        preferences: {
          theme: "dark",
          language: "en-US",
          notifications: {
            email: true,
            push: false,
            sms: true
          },
          privacy: {
            showEmail: false,
            showPhone: true,
            allowTracking: false
          }
        },
        activity: {
          lastLogin: "2023-12-01T09:30:00Z",
          loginCount: 42,
          favoriteFeatures: ["feature1", "feature2", "feature3"]
        }
      }
    },
    focusValue: 25,
    expectedValue: 25,
    actualValue: 26,  // The bug: off by 1
    operation: "set-get law violation"
  };
  
  // Property: "actualValue != expectedValue" (shows the bug)
  const lensPredicate = (violation: typeof complexLensViolation) => {
    return violation.actualValue !== violation.expectedValue;
  };
  
  console.log("\n❌ BEFORE shrinking:");
  console.log(`  Counterexample size: ${estimateSize(complexLensViolation)}`);
  console.log("  Subject (truncated):", JSON.stringify(complexLensViolation.subject).substring(0, 80) + "...");
  console.log("  🤔 Buried in complexity - hard to spot the actual issue!");
  
  const shrunkLensViolation = applyShrinking(complexLensViolation, lensPredicate);
  
  console.log("\n✅ AFTER shrinking:");
  console.log(`  Minimal violation: ${JSON.stringify(shrunkLensViolation)}`);
  console.log(`  Size: ${estimateSize(shrunkLensViolation)}`);
  console.log("  🎯 Bug is immediately obvious: 26 ≠ 25!");
  
  const lensReduction = ((estimateSize(complexLensViolation) - estimateSize(shrunkLensViolation)) / estimateSize(complexLensViolation) * 100);
  console.log(`  Reduction: ${lensReduction.toFixed(1)}%`);
  
  console.log("\n📊 OVERALL IMPACT SUMMARY");
  
  const scenarios = [
    { name: "Array Property", before: estimateSize(largeFailingArray), after: estimateSize(shrunkArray) },
    { name: "Complex Object", before: estimateSize(complexFailingObject), after: estimateSize(shrunkObject) },
    { name: "Lens Violation", before: estimateSize(complexLensViolation), after: estimateSize(shrunkLensViolation) }
  ];
  
  console.log("\n| Scenario | Before | After | Reduction |");
  console.log("|----------|--------|-------|-----------|");
  
  for (const scenario of scenarios) {
    const reduction = ((scenario.before - scenario.after) / scenario.before * 100);
    console.log(`| ${scenario.name.padEnd(12)} | ${scenario.before.toString().padEnd(6)} | ${scenario.after.toString().padEnd(5)} | ${reduction.toFixed(1)}% |`);
  }
  
  const avgReduction = scenarios.reduce((sum, s) => {
    return sum + ((s.before - s.after) / s.before * 100);
  }, 0) / scenarios.length;
  
  console.log(`\nAverage size reduction: ${avgReduction.toFixed(1)}%`);
}

console.log("\n📈 DEBUGGING EXPERIENCE TRANSFORMATION");

console.log("\n❌ BEFORE (typical failing law report):");
console.log(`{
  "operation": "monad-left-unit-law",
  "context": {
    "testSuite": "comprehensive-monad-verification",
    "iteration": 247,
    "seed": 1234567890,
    "configuration": {
      "domainSize": 50,
      "codomain": ["val1", "val2", "val3", "val4", "val5"],
      "functions": [...],
      "metadata": {...}
    }
  },
  "witness": {
    "input": 42,
    "function": "<complex function object>",
    "leftSide": {"tag": "some", "value": 42},
    "rightSide": {"tag": "some", "value": 43},
    "additionalContext": {...}
  }
}`);

console.log("\n✅ AFTER (shrunk minimal counterexample):");
console.log(`{
  "input": 1,
  "leftSide": {"tag": "some", "value": 1},
  "rightSide": {"tag": "some", "value": 2}
}`);

console.log("\n🎯 BENEFITS:");
console.log("• Immediate problem identification");
console.log("• Faster debugging cycles");
console.log("• Cleaner test reports");
console.log("• Better understanding of failure modes");
console.log("• Easier bug reproduction");

// Run the demonstration
demonstrateBeforeAfter();