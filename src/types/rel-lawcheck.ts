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
import { 
  LawCheck, lawCheck,
  ResidualAdjunctionWitness, TransformerAdjunctionWitness, 
  GaloisAdjunctionWitness, AllegoryLawWitness
} from './witnesses.js';

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

export type RelationalLawResults = {
  residualLaws: {
    leftAdjunction: Array<LawCheck<ResidualAdjunctionWitness<any, any, any>>>;
    rightAdjunction: Array<LawCheck<ResidualAdjunctionWitness<any, any, any>>>;
  };
  transformerLaws: Array<LawCheck<TransformerAdjunctionWitness<any>>>;
  galoisLaws: {
    existsPreimage: Array<LawCheck<GaloisAdjunctionWitness<any, any>>>;
    preimageForall: Array<LawCheck<GaloisAdjunctionWitness<any, any>>>;
  };
  allegoryLaws: {
    daggerInvolution: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
    modularLeft: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
  };
  compositionLaws: {
    associativity: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
    identity: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
  };
};

/** Test residual adjunction laws on random data */
export function testResidualLaws(iterations: number = 100): {
  leftAdjunction: Array<LawCheck<ResidualAdjunctionWitness<any, any, any>>>;
  rightAdjunction: Array<LawCheck<ResidualAdjunctionWitness<any, any, any>>>;
} {
  const leftResults: Array<LawCheck<ResidualAdjunctionWitness<any, any, any>>> = [];
  const rightResults: Array<LawCheck<ResidualAdjunctionWitness<any, any, any>>> = [];
  
  const A = new Finite([0, 1, 2]);
  const B = new Finite(['a', 'b', 'c']);
  const C = new Finite(['X', 'Y']);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(A, B);
    const S = randomRel(A, C);
    const X = randomRel(B, C);
    
    // Test left adjunction: R;X ≤ S ⟺ X ≤ R\S
    try {
      const leftHolds = adjunctionLeftHolds(R, X, S);
      if (!leftHolds) {
        const witness: ResidualAdjunctionWitness<any, any, any> = {
          R: R.toPairs(),
          X: X.toPairs(),
          S: S.toPairs(),
          leftSide: false, // R;X ≤ S failed
          rightSide: false, // X ≤ R\S failed
          violatingPair: R.toPairs()[0] || [0, 'a'], // First pair as example
          shrunk: { R: R.toPairs().slice(0, 2), X: X.toPairs().slice(0, 2), S: S.toPairs().slice(0, 2) }
        };
        leftResults.push(lawCheck(false, witness, `Left adjunction failed at iteration ${i}`));
      } else {
        leftResults.push(lawCheck(true, undefined, `Left adjunction passed at iteration ${i}`));
      }
    } catch (e) {
      const witness: ResidualAdjunctionWitness<any, any, any> = {
        R: R.toPairs(),
        X: X.toPairs(),
        S: S.toPairs(),
        leftSide: false,
        rightSide: false,
        violatingPair: ['error', e]
      };
      leftResults.push(lawCheck(false, witness, `Left adjunction error at iteration ${i}: ${e}`));
    }
    
    // Test right adjunction: R;X ≤ S ⟺ R ≤ S/X
    try {
      const rightHolds = adjunctionRightHolds(R, X, S);
      if (!rightHolds) {
        const witness: ResidualAdjunctionWitness<any, any, any> = {
          R: R.toPairs(),
          X: X.toPairs(),
          S: S.toPairs(),
          leftSide: false, // R;X ≤ S failed
          rightSide: false, // R ≤ S/X failed
          violatingPair: R.toPairs()[0] || [0, 'a'],
          shrunk: { R: R.toPairs().slice(0, 2), X: X.toPairs().slice(0, 2), S: S.toPairs().slice(0, 2) }
        };
        rightResults.push(lawCheck(false, witness, `Right adjunction failed at iteration ${i}`));
      } else {
        rightResults.push(lawCheck(true, undefined, `Right adjunction passed at iteration ${i}`));
      }
    } catch (e) {
      const witness: ResidualAdjunctionWitness<any, any, any> = {
        R: R.toPairs(),
        X: X.toPairs(),
        S: S.toPairs(),
        leftSide: false,
        rightSide: false,
        violatingPair: ['error', e]
      };
      rightResults.push(lawCheck(false, witness, `Right adjunction error at iteration ${i}: ${e}`));
    }
  }
  
  return { leftAdjunction: leftResults, rightAdjunction: rightResults };
}

/** Test wp/sp adjunction: sp(P,R) ⊆ Q ⟺ P ⊆ wp(R,Q) */
export function testTransformerLaws(iterations: number = 100): Array<LawCheck<TransformerAdjunctionWitness<any>>> {
  const results: Array<LawCheck<TransformerAdjunctionWitness<any>>> = [];
  
  const States = new Finite([0, 1, 2, 3]);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(States, States);
    const P = randomSubset(States);
    const Q = randomSubset(States);
    
    try {
      const spPR = sp(P, R);
      const wpRQ = wp(R, Q);
      
      const leftHolds = spPR.leq(Q);
      const rightHolds = P.leq(wpRQ);
      
      if (leftHolds === rightHolds) {
        results.push(lawCheck(true, undefined, `wp/sp adjunction passed at iteration ${i}`));
      } else {
        const witness: TransformerAdjunctionWitness<any> = {
          P: P.elems,
          R: R.toPairs(),
          Q: Q.elems,
          spPR: spPR.elems,
          wpRQ: wpRQ.elems,
          leftHolds,
          rightHolds,
          violatingState: States.elems[0], // First state as example
          shrunk: { 
            P: P.elems.slice(0, 2), 
            R: R.toPairs().slice(0, 2), 
            Q: Q.elems.slice(0, 2) 
          }
        };
        results.push(lawCheck(false, witness, `wp/sp adjunction failed at iteration ${i}`));
      }
    } catch (e) {
      const witness: TransformerAdjunctionWitness<any> = {
        P: P.elems,
        R: R.toPairs(),
        Q: Q.elems,
        spPR: `Error: ${e}`,
        wpRQ: `Error: ${e}`,
        leftHolds: false,
        rightHolds: false,
        violatingState: `Error: ${e}`
      };
      results.push(lawCheck(false, witness, `wp/sp adjunction error at iteration ${i}: ${e}`));
    }
  }
  
  return results;
}

/** Test Galois connection laws ∃_f ⊣ f* ⊣ ∀_f */
export function testGaloisLaws(iterations: number = 50): {
  existsPreimage: Array<LawCheck<GaloisAdjunctionWitness<any, any>>>;
  preimageForall: Array<LawCheck<GaloisAdjunctionWitness<any, any>>>;
} {
  const existsResults: Array<LawCheck<GaloisAdjunctionWitness<any, any>>> = [];
  const forallResults: Array<LawCheck<GaloisAdjunctionWitness<any, any>>> = [];
  
  const A = new Finite([0, 1, 2]);
  const B = new Finite(['x', 'y']);
  
  for (let i = 0; i < iterations; i++) {
    const f = randomFun(A, B);
    const P = randomSubset(A);
    const Q = randomSubset(B);
    const R = randomSubset(A);
    
    try {
      // Test ∃_f ⊣ f*
      const existsHolds = adjunctionExistsPreimageHolds(A, B, f, P, Q);
      if (existsHolds) {
        existsResults.push(lawCheck(true, undefined, `∃_f ⊣ f* passed at iteration ${i}`));
      } else {
        const witness: GaloisAdjunctionWitness<any, any> = {
          f,
          P: P.elems,
          Q: Q.elems,
          R: R.elems,
          adjunctionType: "exists-preimage",
          leftHolds: false,
          rightHolds: false,
          violatingElement: A.elems[0],
          shrunk: { P: P.elems.slice(0, 2), Q: Q.elems.slice(0, 2), R: R.elems.slice(0, 2) }
        };
        existsResults.push(lawCheck(false, witness, `∃_f ⊣ f* failed at iteration ${i}`));
      }
      
      // Test f* ⊣ ∀_f  
      const forallHolds = adjunctionPreimageForallHolds(A, B, f, Q, R);
      if (forallHolds) {
        forallResults.push(lawCheck(true, undefined, `f* ⊣ ∀_f passed at iteration ${i}`));
      } else {
        const witness: GaloisAdjunctionWitness<any, any> = {
          f,
          P: P.elems,
          Q: Q.elems,
          R: R.elems,
          adjunctionType: "preimage-forall",
          leftHolds: false,
          rightHolds: false,
          violatingElement: B.elems[0],
          shrunk: { P: P.elems.slice(0, 2), Q: Q.elems.slice(0, 2), R: R.elems.slice(0, 2) }
        };
        forallResults.push(lawCheck(false, witness, `f* ⊣ ∀_f failed at iteration ${i}`));
      }
    } catch (e) {
      const errorWitness: GaloisAdjunctionWitness<any, any> = {
        f,
        P: P.elems,
        Q: Q.elems,
        R: R.elems,
        adjunctionType: "exists-preimage",
        leftHolds: false,
        rightHolds: false,
        violatingElement: `Error: ${e}`
      };
      existsResults.push(lawCheck(false, errorWitness, `Galois chain error at iteration ${i}: ${e}`));
    }
  }
  
  return { existsPreimage: existsResults, preimageForall: forallResults };
}

/** Test allegory laws (dagger involution, modularity, etc.) */
export function testAllegoryLaws(iterations: number = 100): {
  daggerInvolution: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
  modularLeft: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
} {
  const daggerResults: Array<LawCheck<AllegoryLawWitness<any, any, any>>> = [];
  const modularResults: Array<LawCheck<AllegoryLawWitness<any, any, any>>> = [];
  
  const A = new Finite([0, 1, 2]);
  const B = new Finite(['a', 'b']);
  const C = new Finite(['X', 'Y']);
  
  for (let i = 0; i < iterations; i++) {
    const R = randomRel(A, B);
    const S = randomRel(B, C);
    const T = randomRel(B, C);
    
    try {
      // Test dagger involution: R†† = R
      const daggerHolds = RelOrder.daggerInvolutive(R);
      if (daggerHolds) {
        daggerResults.push(lawCheck(true, undefined, `Dagger involution passed at iteration ${i}`));
      } else {
        const witness: AllegoryLawWitness<any, any, any> = {
          lawType: "dagger-involution",
          R: R.toPairs(),
          leftSide: "R††",
          rightSide: R.toPairs(),
          violatingPair: R.toPairs()[0] || [0, 'a'],
          shrunk: { R: R.toPairs().slice(0, 2), S: [], T: [] }
        };
        daggerResults.push(lawCheck(false, witness, `Dagger involution failed at iteration ${i}`));
      }
      
      // Test modular law: R;(S∩T) ≤ R;S ∩ R;T
      const modularHolds = RelOrder.modularLeft(R, S, T);
      if (modularHolds) {
        modularResults.push(lawCheck(true, undefined, `Modular law passed at iteration ${i}`));
      } else {
        const witness: AllegoryLawWitness<any, any, any> = {
          lawType: "modular-left",
          R: R.toPairs(),
          S: S.toPairs(),
          T: T.toPairs(),
          leftSide: "R;(S∩T)",
          rightSide: "R;S ∩ R;T",
          violatingPair: R.toPairs()[0] || [0, 'a'],
          shrunk: { 
            R: R.toPairs().slice(0, 2), 
            S: S.toPairs().slice(0, 2), 
            T: T.toPairs().slice(0, 2) 
          }
        };
        modularResults.push(lawCheck(false, witness, `Modular law failed at iteration ${i}`));
      }
    } catch (e) {
      const errorWitness: AllegoryLawWitness<any, any, any> = {
        lawType: "dagger-involution",
        R: R.toPairs(),
        leftSide: `Error: ${e}`,
        rightSide: `Error: ${e}`,
        violatingPair: ['error', e]
      };
      daggerResults.push(lawCheck(false, errorWitness, `Allegory law error at iteration ${i}: ${e}`));
    }
  }
  
  return { daggerInvolution: daggerResults, modularLeft: modularResults };
}

/** Test composition laws and identities */
export function testCompositionLaws(iterations: number = 100): {
  associativity: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
  identity: Array<LawCheck<AllegoryLawWitness<any, any, any>>>;
} {
  const assocResults: Array<LawCheck<AllegoryLawWitness<any, any, any>>> = [];
  const idResults: Array<LawCheck<AllegoryLawWitness<any, any, any>>> = [];
  
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
        assocResults.push(lawCheck(true, undefined, `Composition associativity passed at iteration ${i}`));
      } else {
        const witness: AllegoryLawWitness<any, any, any> = {
          lawType: "composition-associativity",
          R: R.toPairs(),
          S: S.toPairs(),
          T: T.toPairs(),
          leftSide: left.toPairs(),
          rightSide: right.toPairs(),
          violatingPair: left.toPairs()[0] || [0, true],
          shrunk: { 
            R: R.toPairs().slice(0, 2), 
            S: S.toPairs().slice(0, 2), 
            T: T.toPairs().slice(0, 2) 
          }
        };
        assocResults.push(lawCheck(false, witness, `Composition associativity failed at iteration ${i}`));
      }
      
      // Test identity: R;id = R = id;R
      const idA = Rel.id(A);
      const idB = Rel.id(B);
      const leftId = R.compose(idB);
      const rightId = idA.compose(R);
      
      if (JSON.stringify(R.toPairs()) === JSON.stringify(leftId.toPairs()) &&
          JSON.stringify(R.toPairs()) === JSON.stringify(rightId.toPairs())) {
        idResults.push(lawCheck(true, undefined, `Identity law passed at iteration ${i}`));
      } else {
        const witness: AllegoryLawWitness<any, any, any> = {
          lawType: "composition-associativity", // Reusing for identity
          R: R.toPairs(),
          leftSide: leftId.toPairs(),
          rightSide: rightId.toPairs(),
          violatingPair: R.toPairs()[0] || [0, 'a'],
          shrunk: { R: R.toPairs().slice(0, 2), S: [], T: [] }
        };
        idResults.push(lawCheck(false, witness, `Identity law failed at iteration ${i}`));
      }
    } catch (e) {
      const errorWitness: AllegoryLawWitness<any, any, any> = {
        lawType: "composition-associativity",
        R: R.toPairs(),
        S: S.toPairs(),
        T: T.toPairs(),
        leftSide: `Error: ${e}`,
        rightSide: `Error: ${e}`,
        violatingPair: ['error', e]
      };
      assocResults.push(lawCheck(false, errorWitness, `Composition error at iteration ${i}: ${e}`));
    }
  }
  
  return { associativity: assocResults, identity: idResults };
}

/************ Comprehensive test suite ************/
export function runAllTests(iterations: number = 50): RelationalLawResults & {
  summary: { totalPassed: number; totalFailed: number; successRate: number };
} {
  console.log("=".repeat(80));
  console.log("RELATIONAL LAW CHECKING SUITE");
  console.log("=".repeat(80));
  
  console.log(`\nRunning ${iterations} iterations of each test...`);
  
  const residualResults = testResidualLaws(iterations);
  const transformerResults = testTransformerLaws(iterations);
  const galoisResults = testGaloisLaws(iterations);
  const allegoryResults = testAllegoryLaws(iterations);
  const compositionResults = testCompositionLaws(iterations);
  
  // Count passed/failed from LawCheck results
  const countResults = (results: Array<LawCheck<any>>) => {
    return results.reduce((acc, result) => {
      if (result.ok) acc.passed++;
      else acc.failed++;
      return acc;
    }, { passed: 0, failed: 0 });
  };
  
  const residualCounts = {
    left: countResults(residualResults.leftAdjunction),
    right: countResults(residualResults.rightAdjunction)
  };
  const transformerCounts = countResults(transformerResults);
  const galoisCounts = {
    exists: countResults(galoisResults.existsPreimage),
    forall: countResults(galoisResults.preimageForall)
  };
  const allegoryCounts = {
    dagger: countResults(allegoryResults.daggerInvolution),
    modular: countResults(allegoryResults.modularLeft)
  };
  const compositionCounts = {
    assoc: countResults(compositionResults.associativity),
    identity: countResults(compositionResults.identity)
  };
  
  const totalPassed = residualCounts.left.passed + residualCounts.right.passed +
                     transformerCounts.passed + galoisCounts.exists.passed + 
                     galoisCounts.forall.passed + allegoryCounts.dagger.passed +
                     allegoryCounts.modular.passed + compositionCounts.assoc.passed +
                     compositionCounts.identity.passed;
                     
  const totalFailed = residualCounts.left.failed + residualCounts.right.failed +
                     transformerCounts.failed + galoisCounts.exists.failed + 
                     galoisCounts.forall.failed + allegoryCounts.dagger.failed +
                     allegoryCounts.modular.failed + compositionCounts.assoc.failed +
                     compositionCounts.identity.failed;
                     
  const successRate = totalPassed / (totalPassed + totalFailed);
  
  return {
    residualLaws: residualResults,
    transformerLaws: transformerResults,
    galoisLaws: galoisResults,
    allegoryLaws: allegoryResults,
    compositionLaws: compositionResults,
    summary: { totalPassed, totalFailed, successRate }
  };
}

/************ Pretty printing for test results ************/
export function printLawCheckResults(name: string, results: Array<LawCheck<any>>): void {
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  
  console.log(`\n${name}:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`  Sample failures (first 3):`);
    const failures = results.filter(r => !r.ok).slice(0, 3);
    for (const failure of failures) {
      console.log(`    ${failure.note || 'Law violation'}`);
      if (failure.witness && typeof failure.witness === 'object') {
        const witnessStr = JSON.stringify(failure.witness, null, 2);
        console.log(`      Witness: ${witnessStr.substring(0, 200)}${witnessStr.length > 200 ? '...' : ''}`);
      }
    }
  }
}

export function printTestSummary(results: ReturnType<typeof runAllTests>): void {
  printLawCheckResults("Residual Left Adjunction", results.residualLaws.leftAdjunction);
  printLawCheckResults("Residual Right Adjunction", results.residualLaws.rightAdjunction);
  printLawCheckResults("Transformer Laws", results.transformerLaws);
  printLawCheckResults("Galois Exists-Preimage", results.galoisLaws.existsPreimage);
  printLawCheckResults("Galois Preimage-Forall", results.galoisLaws.preimageForall);
  printLawCheckResults("Allegory Dagger Involution", results.allegoryLaws.daggerInvolution);
  printLawCheckResults("Allegory Modular Left", results.allegoryLaws.modularLeft);
  printLawCheckResults("Composition Associativity", results.compositionLaws.associativity);
  printLawCheckResults("Composition Identity", results.compositionLaws.identity);
  
  console.log(`\n${"=".repeat(80)}`);
  console.log("OVERALL SUMMARY:");
  console.log(`  Total Passed: ${results.summary.totalPassed}`);
  console.log(`  Total Failed: ${results.summary.totalFailed}`);
  console.log(`  Success Rate: ${(results.summary.successRate * 100).toFixed(1)}%`);
  console.log(`${"=".repeat(80)}`);
}