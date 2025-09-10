/**
 * Demonstration of how our First Isomorphism Theorem implementation
 * naturally follows the plural idiom without ever appealing to "set objects"
 */

import { FinGroup, FinGroupMor } from "./FinGrp";
import { kernel, image, cosets, firstIso } from "./first_iso";

/**
 * PLURAL IDIOM: "A group G is some objects G equipped with a binary operation"
 * 
 * We don't need to posit a "thing called the set" over and above its members.
 * We just plural-talk our way through, as if the group *is* its members with structure.
 */

export function demonstratePluralIdiom<A, B>(
  G: FinGroup<A>, 
  H: FinGroup<B>, 
  f: FinGroupMor<A, B>
) {
  console.log("=== PLURAL IDIOM DEMONSTRATION ===");
  console.log("Group G consists of:", G.carrier);
  console.log("Group H consists of:", H.carrier);
  console.log("Homomorphism f:", f.run);
  
  // PLURAL IDIOM: "those elements of G that map to identity in H"
  // Not: "the set of kernel elements"
  const ker = kernel(G, H, f);
  console.log("\nKernel: those elements of G that map to identity in H");
  console.log("ker(f) =", ker);
  
  // PLURAL IDIOM: "those elements of H that arise as f(g) for some g"
  // Not: "the set of image elements"  
  const img = image(G, f);
  console.log("\nImage: those elements of H that arise as f(g) for some g");
  console.log("im(f) =", img);
  
  // PLURAL IDIOM: "those cosets of the kernel"
  // Not: "the set of cosets"
  const cosetList = cosets(G, ker);
  console.log("\nCosets: those cosets of the kernel");
  console.log("G/ker(f) =", cosetList);
  
  // PLURAL IDIOM: "send the coset of g to the element f(g)"
  // Not: "construct a set-theoretic bijection"
  const { phi } = firstIso(G, H, f);
  console.log("\nIsomorphism: send the coset of g to the element f(g)");
  console.log("φ: G/ker(f) → im(f)");
  
  for (const coset of cosetList) {
    const representative = coset[0];
    const imageElement = phi(coset);
    const expectedImage = f.run(representative);
    console.log(`  φ([${coset.join(', ')}]) = ${imageElement} = f(${representative})`);
    console.log(`  ✓ ${imageElement} === ${expectedImage}`);
  }
  
  console.log("\n=== KEY INSIGHT ===");
  console.log("We never needed to construct 'the set of all cosets'");
  console.log("or 'the set of all image elements' - we just work with");
  console.log("'those cosets' and 'those image elements' directly.");
  console.log("This is the plural idiom at work: handling the many");
  console.log("without positing an extra singular entity beyond them.");
}

/**
 * Show how both idioms converge in practice
 */
export function showIdiomConvergence<A, B>(
  G: FinGroup<A>, 
  H: FinGroup<B>, 
  f: FinGroupMor<A, B>
) {
  console.log("\n=== IDIOM CONVERGENCE ===");
  
  // SINGULAR IDIOM: "The kernel is a subset of G"
  // PLURAL IDIOM: "The kernel consists of those elements of G that..."
  // Both lead to the same computation:
  const ker = kernel(G, H, f);
  console.log("SINGULAR: 'The kernel is a subset of G'");
  console.log("PLURAL: 'The kernel consists of those elements of G that map to identity'");
  console.log("RESULT:", ker);
  
  // SINGULAR IDIOM: "The image is a subset of H"
  // PLURAL IDIOM: "The image consists of those elements of H that..."
  // Both lead to the same computation:
  const img = image(G, f);
  console.log("\nSINGULAR: 'The image is a subset of H'");
  console.log("PLURAL: 'The image consists of those elements of H that are hit by f'");
  console.log("RESULT:", img);
  
  console.log("\n=== THE PAYOFF ===");
  console.log("Both idioms converge in practice:");
  console.log("- They both let you define Grp, build morphisms, test laws, and prove theorems");
  console.log("- The plural idiom just postpones committing to a particular foundation");
  console.log("- while still letting us manipulate things concretely");
  console.log("- Our code scaffolding is already plural-friendly!");
}
