// rel-lawcheck.ts
// Randomized property testing suite for relational laws and adjunctions
// Fuzzes residual adjunctions, wp/sp algebraic identities, and Galois connections

import { 
  Finite, Subset, Rel, Fun, 
  leftResidual, rightResidual, adjunctionLeftHolds, adjunctionRightHolds,
  sp, wp, existsAlong, preimageSub, forallAlong, 
  adjunctionExistsPreimageHolds, adjunctionPreimageForallHolds,
  generateAllSubsets, graph, RelOrder
} from './rel-equipment.js';

/************ Random generation utilities ************/

/** Generate random subset of a finite set */
function randomSubset<T>(U: Finite<T>, density: number = 0.5): Subset<T> {
  return Subset.by(U, _ => Math.random() < density);
}

/** Generate random relation between finite sets */
function randomRel<A,B>(A: Finite<A>, B: Finite<B>, density: number = 0.3): Rel<A,B> {
  const pairs: [A, B][] = [];
  for (const a of A.elems) {
    for (const b of B.elems) {
      if (Math.random() < density) {
        pairs.push([a, b]);
      }
    }
  }
  return Rel.fromPairs(A, B, pairs);
}

/** Generate random function between finite sets */
function randomFun<A,B>(A: Finite<A>, B: Finite<B>): Fun<A,B> {
  const mapping = new Map<A, B>();
  for (const a of A.elems) {
    const b = B.elems[Math.floor(Math.random() * B.elems.length)]!;
    mapping.set(a, b);
  }
  return (a: A) => mapping.get(a)!;
}

/************ Property test runners ************/

export interface TestResult {
  passed: number;
  failed: number;
  failures: Array<{test: string; details: string}>;
}

/** Test residual adjunction laws on random data */
export function testResidualLaws(iterations: number = 100): TestResult {
  const result: TestResult = { passed: 0, failed: 0, failures: [] };
  
  const A = new Finite([0, 1, 2]);
  const B = new Finite(['a', 'b', 'c']);
  const C = new Finite(['X', 'Y']);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(A, B);
    const S = randomRel(A, C);
    const X = randomRel(B, C);
    
    // Test left adjunction: R;X ≤ S ⟺ X ≤ R\S
    try {
      if (adjunctionLeftHolds(R, X, S)) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "leftAdjunction",
          details: `Iteration ${i}: R;X ≤ S ⟺ X ≤ R\\S failed`
        });
      }
    } catch (e) {
      result.failed++;
      result.failures.push({
        test: "leftAdjunction", 
        details: `Iteration ${i}: Error - ${e}`
      });
    }
    
    // Test right adjunction: R;X ≤ S ⟺ R ≤ S/X
    try {
      if (adjunctionRightHolds(R, X, S)) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "rightAdjunction",
          details: `Iteration ${i}: R;X ≤ S ⟺ R ≤ S/X failed`
        });
      }
    } catch (e) {
      result.failed++;
      result.failures.push({
        test: "rightAdjunction",
        details: `Iteration ${i}: Error - ${e}`
      });
    }
  }
  
  return result;
}

/** Test wp/sp adjunction: sp(P,R) ⊆ Q ⟺ P ⊆ wp(R,Q) */
export function testTransformerLaws(iterations: number = 100): TestResult {
  const result: TestResult = { passed: 0, failed: 0, failures: [] };
  
  const States = new Finite([0, 1, 2, 3]);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(States, States);
    const P = randomSubset(States);
    const Q = randomSubset(States);
    
    try {
      const spPR = sp(P, R);
      const wpRQ = wp(R, Q);
      
      const lhs = spPR.leq(Q);
      const rhs = P.leq(wpRQ);
      
      if (lhs === rhs) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "wpSpAdjunction",
          details: `Iteration ${i}: sp(P,R) ⊆ Q (${lhs}) ≠ P ⊆ wp(R,Q) (${rhs})`
        });
      }
    } catch (e) {
      result.failed++;
      result.failures.push({
        test: "wpSpAdjunction",
        details: `Iteration ${i}: Error - ${e}`
      });
    }
  }
  
  return result;
}

/** Test Galois connection laws ∃_f ⊣ f* ⊣ ∀_f */
export function testGaloisLaws(iterations: number = 50): TestResult {
  const result: TestResult = { passed: 0, failed: 0, failures: [] };
  
  const A = new Finite([0, 1, 2]);
  const B = new Finite(['x', 'y']);
  
  for (let i = 0; i < iterations; i++) {
    const f = randomFun(A, B);
    const P = randomSubset(A);
    const Q = randomSubset(B);
    const R = randomSubset(A);
    
    try {
      // Test ∃_f ⊣ f*
      if (adjunctionExistsPreimageHolds(A, B, f, P, Q)) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "existsPreimage",
          details: `Iteration ${i}: ∃_f ⊣ f* failed`
        });
      }
      
      // Test f* ⊣ ∀_f  
      if (adjunctionPreimageForallHolds(A, B, f, Q, R)) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "preimageForall", 
          details: `Iteration ${i}: f* ⊣ ∀_f failed`
        });
      }
    } catch (e) {
      result.failed++;
      result.failures.push({
        test: "galoisChain",
        details: `Iteration ${i}: Error - ${e}`
      });
    }
  }
  
  return result;
}

/** Test allegory laws (dagger involution, modularity, etc.) */
export function testAllegoryLaws(iterations: number = 100): TestResult {
  const result: TestResult = { passed: 0, failed: 0, failures: [] };
  
  const A = new Finite([0, 1, 2]);
  const B = new Finite(['a', 'b']);
  const C = new Finite(['X', 'Y']);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(A, B);
    const S = randomRel(B, C);
    const T = randomRel(B, C);
    
    try {
      // Test dagger involution: R†† = R
      if (RelOrder.daggerInvolutive(R)) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "daggerInvolution",
          details: `Iteration ${i}: R†† ≠ R`
        });
      }
      
      // Test modular law: R;(S∩T) ≤ R;S ∩ R;T
      if (RelOrder.modularLeft(R, S, T)) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "modularLeft",
          details: `Iteration ${i}: R;(S∩T) ⊈ R;S ∩ R;T`
        });
      }
    } catch (e) {
      result.failed++;
      result.failures.push({
        test: "allegoryLaw",
        details: `Iteration ${i}: Error - ${e}`
      });
    }
  }
  
  return result;
}

/** Test composition laws and identities */
export function testCompositionLaws(iterations: number = 100): TestResult {
  const result: TestResult = { passed: 0, failed: 0, failures: [] };
  
  const A = new Finite([0, 1]);
  const B = new Finite(['a', 'b']);
  const C = new Finite(['X', 'Y']);
  const D = new Finite([true, false]);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(A, B);
    const S = randomRel(B, C);
    const T = randomRel(C, D);
    
    try {
      // Test associativity: (R;S);T = R;(S;T)
      const left = R.compose(S).compose(T);
      const right = R.compose(S.compose(T));
      
      if (JSON.stringify(left.toPairs()) === JSON.stringify(right.toPairs())) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "associativity",
          details: `Iteration ${i}: (R;S);T ≠ R;(S;T)`
        });
      }
      
      // Test identity: R;id = R = id;R
      const idA = Rel.id(A);
      const idB = Rel.id(B);
      const leftId = R.compose(idB);
      const rightId = idA.compose(R);
      
      if (JSON.stringify(R.toPairs()) === JSON.stringify(leftId.toPairs()) &&
          JSON.stringify(R.toPairs()) === JSON.stringify(rightId.toPairs())) {
        result.passed++;
      } else {
        result.failed++;
        result.failures.push({
          test: "identity",
          details: `Iteration ${i}: R;id ≠ R or id;R ≠ R`
        });
      }
    } catch (e) {
      result.failed++;
      result.failures.push({
        test: "composition",
        details: `Iteration ${i}: Error - ${e}`
      });
    }
  }
  
  return result;
}

/************ Comprehensive test suite ************/
export function runAllTests(iterations: number = 50): {
  residuals: TestResult;
  transformers: TestResult;
  galois: TestResult;
  allegory: TestResult;
  composition: TestResult;
  summary: { totalPassed: number; totalFailed: number; successRate: number };
} {
  console.log("=".repeat(80));
  console.log("RELATIONAL LAW CHECKING SUITE");
  console.log("=".repeat(80));
  
  console.log(`\nRunning ${iterations} iterations of each test...`);
  
  const residuals = testResidualLaws(iterations);
  const transformers = testTransformerLaws(iterations);
  const galois = testGaloisLaws(iterations);
  const allegory = testAllegoryLaws(iterations);
  const composition = testCompositionLaws(iterations);
  
  const totalPassed = residuals.passed + transformers.passed + galois.passed + 
                     allegory.passed + composition.passed;
  const totalFailed = residuals.failed + transformers.failed + galois.failed + 
                     allegory.failed + composition.failed;
  const successRate = totalPassed / (totalPassed + totalFailed);
  
  return {
    residuals,
    transformers, 
    galois,
    allegory,
    composition,
    summary: { totalPassed, totalFailed, successRate }
  };
}

/************ Pretty printing for test results ************/
export function printTestResult(name: string, result: TestResult): void {
  console.log(`\n${name}:`);
  console.log(`  Passed: ${result.passed}`);
  console.log(`  Failed: ${result.failed}`);
  if (result.failures.length > 0) {
    console.log(`  Sample failures (first 3):`);
    for (const failure of result.failures.slice(0, 3)) {
      console.log(`    ${failure.test}: ${failure.details}`);
    }
  }
}

export function printTestSummary(results: ReturnType<typeof runAllTests>): void {
  printTestResult("Residual Laws", results.residuals);
  printTestResult("Transformer Laws", results.transformers);
  printTestResult("Galois Laws", results.galois);
  printTestResult("Allegory Laws", results.allegory);
  printTestResult("Composition Laws", results.composition);
  
  console.log(`\n${"=".repeat(80)}`);
  console.log("OVERALL SUMMARY:");
  console.log(`  Total Passed: ${results.summary.totalPassed}`);
  console.log(`  Total Failed: ${results.summary.totalFailed}`);
  console.log(`  Success Rate: ${(results.summary.successRate * 100).toFixed(1)}%`);
  console.log(`${"=".repeat(80)}`);
}