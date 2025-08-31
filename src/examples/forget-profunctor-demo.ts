/**
 * Demonstration of the preserved ForgetProfunctor implementation
 * 
 * This shows the difference between the simplified HKT-compatible version
 * and the original well-formed implementation that was preserved.
 */

import { createForgetStrong, ForgetProfunctor } from '../types';

export function demonstrateForgetProfunctor() {
  console.log('=== ForgetProfunctor Implementation Demo ===');
  
  // Create a ForgetStrong instance for extracting numbers
  const forgetNumberStrong = createForgetStrong<number>();
  
  // Example: Create a ForgetProfunctor that extracts the length of a string
  const lengthForget: ForgetProfunctor<number, string, any> = ((s: string) => s.length) as any;
  
  // Use dimap to preprocess the input
  const processedForget = forgetNumberStrong.dimap(
    lengthForget,
    (input: { text: string }) => input.text, // Extract text field
    (length: number) => length.toString()    // Convert number to string (not used in Forget)
  );
  
  // Test the implementation
  const testInput = { text: "Hello, World!" };
  const result = processedForget(testInput);
  
  console.log('Input:', testInput);
  console.log('Length extracted:', result);
  
  // Demonstrate first() - works with tuples
  const tupleForget = forgetNumberStrong.first(lengthForget);
  const tupleResult = tupleForget(["TypeScript", 42]);
  
  console.log('Tuple input:', ["TypeScript", 42]);
  console.log('First element length:', tupleResult);
  
  console.log('\nThis demonstrates the preserved ForgetProfunctor implementation');
  console.log('which maintains proper type relationships while being compatible');
  console.log('with the HKT system through strategic type casting.');
  
  // Show the difference between implementations
  console.log('\n=== Implementation Comparison ===');
  console.log('1. createForgetStrong<R>(): Well-typed, preserves the original structure');
  console.log('2. forgetStrong(): Simplified for HKT compatibility');
  console.log('Both serve different purposes in the type system.');
}

// Run the demo
if (require.main === module) {
  demonstrateForgetProfunctor();
}
