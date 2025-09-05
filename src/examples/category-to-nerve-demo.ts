/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { 
  showPath,
  showSimplex,
  compose1From2,
  Q_ABC,
  C_free,
  N_free,
  f1,
  g1,
  h1,
  sigma2,
  d0,
  d1,
  d2,
  s1,
  PO_Q
} from '../types';

function demonstrateCategoryToNerve() {
  console.log('=== Category-to-Nerve Demo ===\n');
  
  // 1. Show the quiver structure
  console.log('1. Quiver Q_ABC:');
  console.log('   Objects:', Q_ABC.objects);
  console.log('   Edges:', Q_ABC.edges.map(e => `${e.src}→${e.dst}${e.label ? `(${e.label})` : ''}`));
  console.log();
  
  // 2. Show the free category morphisms
  console.log('2. Free Category Morphisms:');
  console.log('   f1:', showPath(f1));
  console.log('   g1:', showPath(g1));
  console.log('   h1:', showPath(h1));
  console.log();
  
  // 3. Show composition in the free category
  console.log('3. Composition in Free Category:');
  const fg = C_free.compose(g1, f1); // g ∘ f
  console.log('   g ∘ f:', showPath(fg));
  console.log('   Note: g ∘ f ≠ h (different paths, same endpoints)');
  console.log();
  
  // 4. Show the nerve construction
  console.log('4. Nerve Construction (Simplicial Set):');
  console.log('   A 2-simplex σ = [f, g]:', showSimplex(C_free, sigma2));
  console.log('   Dimension:', N_free.dim(sigma2));
  console.log('   Objects:', N_free.objectsOf(sigma2));
  console.log();
  
  // 5. Show face maps
  console.log('5. Face Maps (d_i):');
  console.log('   d₀(σ) = drop first arrow:', showSimplex(C_free, d0));
  console.log('   d₁(σ) = compose g∘f:', showSimplex(C_free, d1));
  console.log('   d₂(σ) = drop last arrow:', showSimplex(C_free, d2));
  console.log();
  
  // 6. Show degeneracy maps
  console.log('6. Degeneracy Maps (s_i):');
  console.log('   s₁(σ) = insert id at position 1:', showSimplex(C_free, s1));
  console.log('   This creates a 3-simplex with an identity inserted');
  console.log();
  
  // 7. Show composition via 2-simplex
  console.log('7. Composition via 2-Simplex:');
  const composed = compose1From2(C_free, sigma2);
  console.log('   compose1From2(σ):', showSimplex(C_free, composed));
  console.log('   This is the same as d₁(σ) - the composed morphism');
  console.log();
  
  // 8. Show pushout construction
  console.log('8. Pushout Construction:');
  console.log('   Pushout Q1 ⨿_{Q0} Q2:');
  console.log('   Objects:', PO_Q.objects);
  console.log('   Edges:', PO_Q.edges.map(e => `${e.src}→${e.dst}${e.label ? `(${e.label})` : ''}`));
  console.log('   This glues two quivers along a common object B');
  console.log();
  
  // 9. Show how this connects to HoTT
  console.log('9. Connection to Homotopy Type Theory:');
  console.log('   • Categories → Simplicial Sets via Nerve');
  console.log('   • Face maps model boundary operators');
  console.log('   • Degeneracy maps model identity insertions');
  console.log('   • Pushouts model homotopy colimits');
  console.log('   • This gives a combinatorial model of homotopy types');
  console.log();
  
  console.log('=== How these pieces click together ===');
  console.log('• Quivers provide the "graph" structure for categories');
  console.log('• Free categories add composition and identities');
  console.log('• Nerve construction turns categories into simplicial sets');
  console.log('• Face/degeneracy maps encode the simplicial structure');
  console.log('• Pushouts enable gluing and colimit constructions');
  console.log('• This bridges combinatorics to algebraic topology');
}

// Run the demo
if (require.main === module) {
  demonstrateCategoryToNerve();
}
