/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { ForgetProfunctor, createForgetStrong, forgetStrong } from '../types';

function demonstrateTypePatterns() {
  console.log('=== Type Implementation Patterns Demo ===\n');

  // Pattern 1: Named First-Class Types
  console.log('1. Named First-Class Types:');
  console.log('   - ForgetProfunctor<R, A, B> is a TYPE');
  console.log('   - Defines structure once, reused everywhere');
  console.log('   - Type-level constraints and reasoning');
  
  // You can use this type in signatures
  const myForget: ForgetProfunctor<number, string, any> = ((s: string) => s.length) as any;
  console.log('   - Can be used directly in type annotations');
  console.log('   - Example instance created:', typeof myForget, '\n');

  // Pattern 2: Functions Returning Type Shapes (Factory Pattern)
  console.log('2. Functions Returning Type Shapes (Factory Pattern):');
  
  // Each call creates a DIFFERENT instance with DIFFERENT behavior
  const stringForgetStrong = createForgetStrong<string>();
  const numberForgetStrong = createForgetStrong<number>();
  const booleanForgetStrong = createForgetStrong<boolean>();
  
  console.log('   - createForgetStrong<string>(): Different behavior for strings');
  console.log('   - createForgetStrong<number>(): Different behavior for numbers');
  console.log('   - createForgetStrong<boolean>(): Different behavior for booleans');
  console.log('   - Each instance is specialized for its type parameter');
  console.log('   - Instance types:', typeof stringForgetStrong, typeof booleanForgetStrong, '\n');

  // Pattern 3: Singleton Functions (Module Pattern)
  console.log('3. Singleton Functions (Module Pattern):');
  
  const singletonForget = forgetStrong();
  console.log('   - forgetStrong(): Returns the same shape every time');
  console.log('   - No type parameters, uniform behavior');
  console.log('   - Used when behavior doesn\'t vary by type');
  console.log('   - Singleton type:', typeof singletonForget, '\n');

  // Practical Example: Why the factory pattern is needed
  console.log('=== Why Factory Pattern is Needed ===\n');
  
  // Different R types need different internal behavior
  const extractLength = (s: string): number => s.length;
  const extractName = (obj: {name: string}): string => obj.name;
  
  // These need DIFFERENT ForgetStrong instances because R is different
  const lengthProcessor = numberForgetStrong.dimap(
    extractLength as any,
    (input: {text: string}) => input.text,
    (n: number) => n.toString()
  );
  
  const nameProcessor = stringForgetStrong.dimap(
    extractName as any,
    (input: {person: {name: string}}) => input.person,
    (s: string) => s.toUpperCase()
  );
  
  console.log('Length processor result:', lengthProcessor({text: "Hello"}));
  console.log('Name processor result:', nameProcessor({person: {name: "Alice"}}));
  
  console.log('\n=== Design Principles ===');
  console.log('1. Use TYPES when structure is fixed and reusable');
  console.log('2. Use FACTORY FUNCTIONS when behavior varies by type parameters');
  console.log('3. Use SINGLETON FUNCTIONS when you need uniform instances');
  console.log('4. Factory pattern enables type-safe specialization');
  console.log('5. Types enable static analysis and constraints');
}

// Additional example: Type-level vs Value-level
function demonstrateTypeLevelVsValueLevel() {
  console.log('\n=== Type-level vs Value-level ===\n');
  
  // Type-level: Exists only during compilation
  // type MyType<T> = { value: T; process: (t: T) => string; };
  // (Example type commented to avoid unused type warning)
  
  // Value-level: Exists at runtime
  const createMyValue = <T>() => ({
    value: null as T,
    process: (t: T): string => String(t)
  });
  
  console.log('Type-level:');
  console.log('  - MyType<T>: Exists only during TypeScript compilation');
  console.log('  - Provides structure and constraints');
  console.log('  - No runtime footprint\n');
  
  console.log('Value-level:');
  console.log('  - createMyValue<T>(): Creates actual runtime objects');
  console.log('  - Contains executable code');
  console.log('  - Can have different behavior per instantiation');
  
  const stringHandler = createMyValue<string>();
  const numberHandler = createMyValue<number>();
  
  console.log('  - Runtime instances can have specialized behavior');
  console.log('  - stringHandler.process("test"):', stringHandler.process("test"));
  console.log('  - numberHandler.process(42):', numberHandler.process(42));
}

// Run the demos
if (require.main === module) {
  demonstrateTypePatterns();
  demonstrateTypeLevelVsValueLevel();
}
