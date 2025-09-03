/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// cont-demo.ts
// Demonstration of the Continuation monad implementation

import { Cont } from '../types/index.js';

function runContDemo() {
  console.log('='.repeat(70));
  console.log('🚀 CONTINUATION MONAD DEMONSTRATION');
  console.log('='.repeat(70));

  // 1. Basic continuation operations
  console.log('\n📋 1. BASIC CONTINUATION OPERATIONS:');
  
  const simple = Cont.Cont.chain<string, number, string>(n => 
    Cont.Cont.of<string>()(`The answer is: ${n}`)
  )(Cont.Cont.of<string>()(42));
  
  const result1 = Cont.Cont.run(simple, x => x);
  console.log('   Input: 42');
  console.log('   Result:', result1);

  // 2. Functor mapping
  console.log('\n🗺️  2. FUNCTOR MAPPING:');
  const mapped = Cont.Cont.map<number, number, string>(n => `Value: ${n}`)(
    Cont.Cont.of<number>()(123)
  );
  const result2 = Cont.Cont.run(mapped, x => x.length);
  console.log('   Mapped "123" to "Value: 123"');
  console.log('   Length of result:', result2);

  // 3. Applicative composition
  console.log('\n🔗 3. APPLICATIVE COMPOSITION:');
  const add = (x: number) => (y: number) => x + y;
  const contAdd = Cont.Cont.of<number>()(add);
  const contX = Cont.Cont.of<number>()(10);
  const contY = Cont.Cont.of<number>()(32);
  
  const applied = Cont.Cont.ap<number, number, (y: number) => number>(contAdd)(contX);
  const result3 = Cont.Cont.ap<number, number, number>(applied)(contY);
  const finalResult = Cont.Cont.run(result3, x => x);
  console.log('   10 + 32 =', finalResult);

  // 4. CPS Factorial demonstration
  console.log('\n🔢 4. CPS FACTORIAL:');
  const fact5 = Cont.factCPS(5);
  const factResult = Cont.Cont.run(fact5, x => x);
  console.log('   5! =', factResult);
  
  const fact7 = Cont.factCPS(7);
  const fact7Result = Cont.Cont.run(fact7, x => x);
  console.log('   7! =', fact7Result);

  // 5. Call/CC for early exit
  console.log('\n🏃 5. CALL/CC EARLY EXIT:');
  const numbers = [1, 3, 5, 8, 9, 12, 15];
  const firstEven = Cont.findFirst((n: number) => n % 2 === 0, numbers);
  const evenResult = Cont.Cont.run(firstEven, x => x ?? 'none');
  console.log('   Numbers:', numbers);
  console.log('   First even:', evenResult);

  const firstBig = Cont.findFirst((n: number) => n > 10, numbers);
  const bigResult = Cont.Cont.run(firstBig, x => x ?? 'none');
  console.log('   First > 10:', bigResult);

  // 6. Continuation composition
  console.log('\n🔄 6. CONTINUATION COMPOSITION:');
  const addTwo = (n: number) => Cont.Cont.of<number>()(n + 2);
  const triple = (n: number) => Cont.Cont.of<number>()(n * 3);
  const composed = Cont.contCompose(triple, addTwo);
  
  const compResult = Cont.Cont.run(composed(4), x => x);
  console.log('   (4 + 2) * 3 =', compResult);

  // 7. Parallel composition
  console.log('\n⚡ 7. PARALLEL COMPOSITION:');
  const contA = Cont.Cont.of<string>()('Hello');
  const contB = Cont.Cont.of<string>()('World');
  const both = Cont.contBoth(contA, contB);
  const bothResult = Cont.Cont.run(both, ([a, b]) => `${a} ${b}!`);
  console.log('   Combined result:', bothResult);

  // 8. Integration with evaluation
  console.log('\n🎯 8. DIRECT EVALUATION:');
  const selfEvaluating = Cont.Cont.chain<string, string, string>(x => 
    Cont.Cont.of<string>()(`Evaluated: ${x}`)
  )(Cont.Cont.of<string>()('test'));
  
  // Convert to self-evaluating form and run
  const directResult = Cont.Cont.eval(selfEvaluating as any);
  console.log('   Direct evaluation result:', directResult);

  console.log('\n' + '='.repeat(70));
  console.log('✅ CONTINUATION MONAD FEATURES DEMONSTRATED:');
  console.log('   🔹 Pure continuation monad operations (of, map, chain, ap)');
  console.log('   🔹 Call/CC for escape continuations and early exit');
  console.log('   🔹 CPS-style recursive computation (factorial)');
  console.log('   🔹 Continuation composition and parallel execution');
  console.log('   🔹 Integration with existing monad infrastructure');
  console.log('   🔹 Type-safe continuation passing style');
  console.log('='.repeat(70));
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runContDemo();
}

export { runContDemo };