/**
 * Simple Category Theory Demo
 * 
 * Demonstrates the existing category theory infrastructure
 * without the complex adjunction theory that was causing conflicts.
 */

import {
  // Core category theory
  SmallCategory, Edge, Quiver, makeFreeCategory,
  // Relations equipment (concrete)
  SetObj, Rel, FnM, makeRelationsDouble, companionOf, conjointOf,
  // Existing discrete category function
  Disc
} from '../types';

console.log('🎯 Simple Category Theory Demo');
console.log('==============================\n');

// ---------- Build a free category A->B->C (+ A->C) and its nerve ----------
console.log('1️⃣ Building free category and nerve...');
const Q: Quiver<string> = {
  objects: ['A', 'B', 'C'],
  edges: [
    { src: 'A', dst: 'B', label: 'f' },
    { src: 'B', dst: 'C', label: 'g' },
    { src: 'A', dst: 'C', label: 'h' }
  ]
};

const A = makeFreeCategory(Q);
console.log('  Free category built with objects:', A.objects);
console.log('  Morphisms:', A.morphisms.map(m => `${m.src}->${m.dst} [${m.edges.map(e => e.label).join('∘')}]`));

// ---------- Test discrete categories ----------
console.log('\n2️⃣ Testing discrete categories...');

// Create discrete categories using existing function
const DiscA = Disc(['a1', 'a2']);
const DiscB = Disc(['b1', 'b2']);

console.log('  Created discrete categories:');
console.log('    DiscA objects:', DiscA.objects);
console.log('    DiscB objects:', DiscB.objects);
console.log('    DiscA morphisms:', DiscA.morphisms.map(m => m.x));
console.log('    DiscB morphisms:', DiscB.morphisms.map(m => m.x));

// Test hom function
console.log('  Hom sets:');
console.log('    hom(a1, a1) =', DiscA.hom('a1', 'a1').map(m => m.x));
console.log('    hom(a1, a2) =', DiscA.hom('a1', 'a2').map(m => m.x));

// ---------- Test relations equipment ----------
console.log('\n3️⃣ Testing relations equipment...');

// Create some simple relations
const R1: Rel = { src: 'X', dst: 'Y', elems: [['x1', 'y1'], ['x2', 'y2']] };
const R2: Rel = { src: 'Y', dst: 'Z', elems: [['y1', 'z1'], ['y2', 'z2']] };

console.log('  Created relations:');
console.log('    R1: X → Y with elements:', R1.elems);
console.log('    R2: Y → Z with elements:', R2.elems);

// Test companion/conjoint
const f: FnM = { src: 'A', dst: 'B', fn: (a) => a === 'a1' ? 'b1' : 'b2' };
const companion = companionOf(f);
const conjoint = conjointOf(f);

console.log('  Function f: A → B where f(a1) = b1, f(a2) = b2');
console.log('  Companion relation:', companion.elems);
console.log('  Conjoint relation:', conjoint.elems);

console.log('\n🎉 Simple category theory demo completed successfully!');
console.log('This demonstrates:');
console.log('  • Free category construction from quivers');
console.log('  • Discrete categories with existing Disc function');
console.log('  • Relations equipment with companions/conjoints');
console.log('  • Basic category theory infrastructure');
