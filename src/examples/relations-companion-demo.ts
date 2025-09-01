/**
 * Relations Companion/Conjoint Demo
 * 
 * Demonstrates the standard graph/cograph construction for functions
 * and the unit/counit squares that witness the adjunction.
 */

import {
  makeRelationsDouble, companionOf, conjointOf,
  unitSquare, counitSquare, trianglesHold,
  SetObj
} from '../types';

function finite<T>(id: string, elems: T[], eq: (x:T,y:T)=>boolean): SetObj<T> {
  return { id, elems, eq };
}

export function demonstrateCompanions() {
  console.log('=== Relations Companion/Conjoint Demo ===\n');
  
  const A = finite('A', [0,1,2], (x,y)=>x===y);
  const B = finite('B', ['a','b'], (x,y)=>x===y);

  const f = { src: A, dst: B, f: (n:number) => (n % 2 === 0 ? 'a' : 'b') };

  console.log('1. Function f: A → B');
  console.log('   A = {0,1,2}, B = {a,b}');
  console.log('   f(n) = "a" if n is even, "b" if n is odd');
  console.log();

  console.log('2. Companion (Graph) Γ_f: A ↔ B');
  const companion = companionOf(f);
  console.log('   Γ_f(a,b) holds when f(a) = b');
  console.log('   Γ_f(0,a) =', companion.holds(0, 'a')); // true
  console.log('   Γ_f(1,a) =', companion.holds(1, 'a')); // false
  console.log('   Γ_f(1,b) =', companion.holds(1, 'b')); // true
  console.log();

  console.log('3. Conjoint (Cograph) Γ_f^†: B ↔ A');
  const conjoint = conjointOf(f);
  console.log('   Γ_f^†(b,a) holds when f(a) = b');
  console.log('   Γ_f^†(a,0) =', conjoint.holds('a', 0)); // true
  console.log('   Γ_f^†(a,1) =', conjoint.holds('a', 1)); // false
  console.log('   Γ_f^†(b,1) =', conjoint.holds('b', 1)); // true
  console.log();

  console.log('4. Unit and Counit Squares');
  const D = makeRelationsDouble();
  try {
    // Unit/counit are inclusion squares; mkSquare throws if inclusion fails:
    unitSquare(D, f);
    console.log('   ✅ Unit square constructed successfully');
    counitSquare(D, f);
    console.log('   ✅ Counit square constructed successfully');
  } catch (error) {
    console.log('   ❌ Square construction failed:', error);
  }
  console.log();

  console.log('5. Triangle Equalities');
  const triangles = trianglesHold(f);
  console.log('   Triangles hold:', triangles); // expect: true
  console.log();

  console.log('6. Mathematical Significance');
  console.log('   • Companion/conjoint provide the standard adjunction for functions');
  console.log('   • Unit/counit squares witness the adjunction in the double category');
  console.log('   • Triangle equalities verify the adjunction laws');
  console.log('   • This is the foundation for "profunctors-as-processes"');
}

// Run the demo
if (require.main === module) {
  demonstrateCompanions();
}
