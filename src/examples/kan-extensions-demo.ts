/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { demoKanExample } from '../types/catkit-kan';

console.log('🎯 Kan Extensions Demo');
console.log('======================\n');

console.log('This demo shows how Kan extensions work:');
console.log('• C = arrow category X → Y (with morphism u: X → Y)');
console.log('• D = terminal category • (one object)');
console.log('• F: C → D (constant functor)');
console.log('• H: C → Set with H(X) = {x0, x1}, H(Y) = {y0}, H(u) collapsing both x_i to y0');
console.log('');

console.log('Expected results:');
console.log('• Left Kan: should coequalize H(u), giving 1 element (the coequalizer)');
console.log('• Right Kan: should give families (α_X, α_Y) satisfying naturality');
console.log('');

// Run the demo
demoKanExample();

console.log('\n🎉 Kan extensions demo completed!');
console.log('');
console.log('What this demonstrates:');
console.log('• Left Kan extension = coend quotient (∫^c D(Fc,d) × H(c))');
console.log('• Right Kan extension = end with naturality filter (∫_c H(c)^{D(d,Fc)})');
console.log('• Both computed explicitly for finite categories using union-find and backtracking');
console.log('• The categorical abstraction becomes concrete, runnable code');
