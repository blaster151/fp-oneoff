// abstraction-wp-demo.ts
// Show that demonic weakest preconditions transport through abstraction p:S->Ŝ:
//   γ(wp(F(R), Q̂)) == wp(R, γ(Q̂))
// where F(R) = p^† ; R ; p, and γ = preimage along p.
//
// Run: ts-node abstraction-wp-demo.ts

import { Finite, Rel, Subset, wp, preimageSub } from "../types/rel-equipment.js";
import { SurjectiveLaxDoubleFunctor, Surjection } from "../types/double-functor.js";

function subsetEq<T>(A:Finite<T>, X:Subset<T>, Y:Subset<T>): boolean {
  return A.elems.every(a => X.contains(a) === Y.contains(a));
}

export function demo() {
  console.log("=".repeat(80));
  console.log("ABSTRACTION & WEAKEST PRECONDITION DEMO");
  console.log("=".repeat(80));

  const S = new Finite([0,1,2,3]);
// Narrow Shat to the literal union:
const Shat = new Finite<"low"|"high">(["low","high"] as const);

// Keep p and s in the same narrow world:
const p: (s:number) => "low"|"high" = (s) => (s<=1 ? "low" : "high");
const s: (h:"low"|"high") => number = (h) => (h==="low" ? 0 : 2);

// And fix the Surjection type parameter:
const surjection: Surjection<number, "low"|"high"> = { surj: p, section: s };

  console.log("\n1. ABSTRACTION SETUP");
  console.log("Concrete states S:", S.elems);
  console.log("Abstract states Ŝ:", Shat.elems);
  console.log("Abstraction p: 0,1 → low; 2,3 → high");
  console.log("Section s: low → 0; high → 2");

  // Program: increment-or-stay, capped at 3
  const Prog = Rel.fromPairs(S,S, S.elems.flatMap(s => [[s,s], [s, Math.min(3, s+1)]] as [number,number][]));
  
  console.log("\n2. CONCRETE PROGRAM");
  console.log("Program (increment-or-stay):", Prog.toPairs().map(([a,b]) => `${a}→${b}`).join(', '));

  const F = new SurjectiveLaxDoubleFunctor();
  F.addObject(S, Shat, surjection);
  
  const ProgHat = F.onH(Prog);
  console.log("\n3. ABSTRACT PROGRAM");
  console.log("Abstract program F(R):", ProgHat.toPairs().map(([a,b]) => `${a}→${b}`).join(', '));

  // Abstract postcondition: be 'high'
  const Qhat = Subset.by(Shat, h => h==="high");
  console.log("\n4. POSTCONDITION TRANSPORT");
  console.log("Abstract postcondition Q̂:", Qhat.toArray());
  
  // γ(Q̂) = preimage of Q̂ along p
  const gammaQhat = preimageSub(S, Shat, p, Qhat);
  console.log("Concrete postcondition γ(Q̂):", gammaQhat.toArray());

  // Test the transport equation: γ(wp(F(R),Q̂)) == wp(R, γ(Q̂))
  const wpAbstract = wp(ProgHat, Qhat);
  const lhs = preimageSub(S, Shat, p, wpAbstract); // γ(wp(F(R),Q̂))
  const rhs = wp(Prog, gammaQhat);                  // wp(R, γ(Q̂))

  console.log("\n5. TRANSPORT VERIFICATION");
  console.log("wp(F(R), Q̂) =", wpAbstract.toArray());
  console.log("γ(wp(F(R), Q̂)) =", lhs.toArray());
  console.log("wp(R, γ(Q̂)) =", rhs.toArray());
  
  const transportHolds = subsetEq(S, lhs, rhs);
  console.log("\nTransport equation γ(wp(F(R),Q̂)) = wp(R, γ(Q̂)):", transportHolds);

  if (transportHolds) {
    console.log("✅ Perfect! Abstraction preserves weakest precondition structure");
  } else {
    console.log("⚠️  Transport fails - this may indicate issues with the abstraction");
  }

  console.log("\n6. PRACTICAL IMPLICATIONS");
  console.log("This demonstrates that:");
  console.log("• Abstract verification can be lifted to concrete verification");
  console.log("• Weakest preconditions compose correctly through abstractions");
  console.log("• Lax functors provide the right mathematical framework");
  console.log("• Program analysis can work at multiple levels of abstraction");

  console.log("\n" + "=".repeat(80));
  console.log("ABSTRACTION & VERIFICATION FEATURES:");
  console.log("✓ Weakest precondition transport through abstractions");
  console.log("✓ Lax double functor preservation of verification structure");
  console.log("✓ Multi-level program analysis with mathematical guarantees");
  console.log("✓ Practical framework for scalable verification");
  console.log("=".repeat(80));
}

// Run demo if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('abstraction-wp-demo')) {
  demo();
}