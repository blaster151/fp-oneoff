/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { FreeAp, apAp, foldFreeAp } from '../types';
import { HKT, Applicative } from '../types';

function demonstrateFreeApplicative() {
  console.log('=== Free Applicative Demo ===\n');
  
  // Create some Free Applicative values
  const pureValue: FreeAp<'Test', string> = { _tag: 'Pure', a: 'hello' };
  
  console.log('1. Pure Free Applicative value:');
  console.log('   ', pureValue);
  
  // More complex Free Applicative with Ap constructor
  const apValue: FreeAp<'Test', string> = {
    _tag: 'Ap',
    fab: null as any, // Would be an HKT<'Test', any> in real usage
    fa: { _tag: 'Pure', a: (x: any) => `processed: ${x}` }
  };
  
  console.log('\n2. Ap Free Applicative value:');
  console.log('   ', apValue);
  
  // Demonstrate apAp function
  const func: FreeAp<'Test', (x: string) => string> = { _tag: 'Pure', a: (x: string) => x.toUpperCase() };
  const value: FreeAp<'Test', string> = { _tag: 'Pure', a: 'world' };
  
  const combined = apAp(func, value);
  console.log('\n3. Combined with apAp:');
  console.log('   func:', func);
  console.log('   value:', value);
  console.log('   combined:', combined);
  
  // Create a simple Applicative for interpretation
  const testApplicative: Applicative<'Test'> = {
    of: <A>(a: A): HKT<'Test', A> => ({ result: a } as any),
    ap: <A, B>(ff: HKT<'Test', (a: A) => B>, fa: HKT<'Test', A>): HKT<'Test', B> => {
      const f = (ff as any).result;
      const a = (fa as any).result;
      return { result: f(a) } as any;
    },
    map: <A, B>(fa: HKT<'Test', A>, f: (a: A) => B): HKT<'Test', B> => {
      const a = (fa as any).result;
      return { result: f(a) } as any;
    }
  };
  
  // Interpret the Free Applicative
  const interpreted = foldFreeAp(testApplicative)((x: any) => x)(pureValue);
  console.log('\n4. Interpreted result:');
  console.log('   ', interpreted);
  
  console.log('\n=== Key Points ===');
  console.log('✅ FreeAp<F, A> is properly defined with Pure and Ap constructors');
  console.log('✅ apAp combines Free Applicative values');
  console.log('✅ foldFreeAp interprets Free Applicative with an Applicative instance');
  console.log('✅ This enables static analysis of effects before execution');
}

// Run the demo
if (require.main === module) {
  demonstrateFreeApplicative();
}
