// spec-impl-demo.ts
// Demo: build a Spec→Impl abstraction, check square inclusions and wp-transport.

import { Finite, Rel, Subset } from "../types/rel-equipment.js";
import { SpecImpl, createCoarsening, verifySurjection, numericRangeAbstraction } from "../types/spec-impl.js";

console.log("=".repeat(80));
console.log("SPEC→IMPL ABSTRACTION FUNCTORS EXPLORATION");
console.log("=".repeat(80));

export function demo() {
  console.log("\n1. BASIC ABSTRACTION SETUP");

  // Spec world: detailed state space
  const A = new Finite([0,1,2,3,4,5]);
  const B = new Finite(["idle", "working", "error", "success", "pending", "retry"]);
  
  // Spec relation: state transitions
  const R = Rel.fromPairs(A,B, [
    [0,"idle"], [0,"working"],
    [1,"working"], [1,"error"], [1,"success"],
    [2,"error"], [2,"retry"],
    [3,"success"], [3,"idle"],
    [4,"pending"], [4,"working"],
    [5,"retry"], [5,"working"]
  ]);

  console.log("Spec state space A:", A.elems);
  console.log("Spec status space B:", B.elems);
  console.log("Spec relation R:", R.toPairs().map(([a,b]) => `${a}→${b}`).join(', '));

  console.log("\n2. ABSTRACTION CONSTRUCTION");

  // Create abstractions via coarsening
  const { impl: Ahat, surj: surjA } = createCoarsening(A, (n: number) => n <= 2 ? "low" : "high");
  const { impl: Bhat, surj: surjB } = createCoarsening(B, (s: string) => 
    ["idle", "success"].includes(s) ? "ok" : "active"
  );

  console.log("Abstract state space Â:", Ahat.elems);
  console.log("Abstract status space B̂:", Bhat.elems);
  
  // Verify surjections are well-formed
  const verifyA = verifySurjection(A, Ahat, surjA);
  const verifyB = verifySurjection(B, Bhat, surjB);
  
  console.log("Surjection A→Â well-formed:", verifyA.isWellFormed);
  console.log("Surjection B→B̂ well-formed:", verifyB.isWellFormed);

  console.log("\n3. SPEC→IMPL FUNCTOR CONSTRUCTION");

  const SI = new SpecImpl();
  SI.addObject({ spec: A, impl: Ahat, surj: surjA });
  SI.addObject({ spec: B, impl: Bhat, surj: surjB });

  // Abstract the relation
  const Rhat = SI.onH(R);
  console.log("Abstract relation R̂:", Rhat.toPairs().map(([a,b]) => `${a}→${b}`).join(', '));

  console.log("\n4. SQUARE INCLUSION VERIFICATION");

  // Create a square in the spec world
  const f = (a: number) => a; // identity for simplicity
  const g = (b: string) => b; // identity for simplicity
  const R1 = Rel.fromPairs(A, B, R.toPairs()); // same relation (identity square)
  
  const specSquare = { A, B, A1: A, B1: B, f, g, R, R1 };
  
  // Check if the square maps to an inclusion in the impl world
  const inclusion = SI.squareToInclusion(specSquare);
  
  console.log("Square inclusion in impl world:");
  console.log("  Left side F(R);F(g):", inclusion.left.toPairs().slice(0, 5).map(([a,b]) => `${a}→${b}`).join(', '), "...");
  console.log("  Right side F(f);F(R1):", inclusion.right.toPairs().slice(0, 5).map(([a,b]) => `${a}→${b}`).join(', '), "...");
  console.log("  Inclusion holds:", inclusion.holds);

  console.log("\n5. WEAKEST PRECONDITION TRANSPORT");

  // Create a program (state transformer)
  const Prog = Rel.fromPairs(A, A, A.elems.flatMap(s => [[s,s], [s, Math.min(5, s+1)]] as [number,number][]));
  console.log("Program (increment-or-stay):", Prog.toPairs().map(([a,b]) => `${a}→${b}`).join(', '));

  // Abstract postcondition
  const Qhat = Subset.by(Bhat, h => h === "ok");
  console.log("Abstract postcondition Q̂ (ok states):", Qhat.toArray());

  // Test WP transport
  const wpTransport = SI.checkWpTransport(A, Ahat, surjA.p, Prog, Qhat);
  
  console.log("WP transport verification:");
  console.log("  γ(wp(F(R),Q̂)):", wpTransport.lhs.toArray());
  console.log("  wp(R, γ(Q̂)):", wpTransport.rhs.toArray());
  console.log("  Transport holds:", wpTransport.holds);

  console.log("\n6. PROPERTY PRESERVATION ANALYSIS");

  // Test if abstraction preserves functional properties
  const isFunctionalProperty = (R: Rel<any, any>) => R.isFunctional();
  const functionalTest = SI.checkPropertyPreservation(isFunctionalProperty, Prog);
  
  console.log("Functional property preservation:");
  console.log("  Spec satisfies functional:", functionalTest.specSatisfies);
  console.log("  Impl satisfies functional:", functionalTest.implSatisfies);
  console.log("  Property preserved:", functionalTest.preserves);

  console.log("\n7. PRACTICAL APPLICATIONS");

  console.log("Spec→Impl abstraction enables:");
  console.log("  • Model checking at multiple abstraction levels");
  console.log("  • Verification that scales from concrete to abstract");
  console.log("  • Automatic coarsening of specifications for efficiency");
  console.log("  • Property preservation guarantees during abstraction");
  console.log("  • Compositional reasoning about system refinements");

  console.log("\n" + "=".repeat(80));
  console.log("SPEC→IMPL ABSTRACTION FEATURES:");
  console.log("✓ Systematic coarsening via surjective lax double functors");
  console.log("✓ Square obligations degrade to checkable inclusions");
  console.log("✓ Weakest precondition transport with mathematical guarantees");
  console.log("✓ Property preservation analysis for abstraction validation");
  console.log("✓ Practical framework for multi-level program verification");
  console.log("=".repeat(80));

  console.log("\n🎯 THEORETICAL FOUNDATIONS:");
  console.log("• Lax double functors provide the mathematical framework");
  console.log("• Surjections model information-preserving abstractions");
  console.log("• Inclusion obligations replace exact equality requirements");
  console.log("• Transport laws ensure verification compositionality");
  console.log("• Categorical correctness guarantees abstraction soundness");
}

demo();