/**
 * Expression DSL Demo
 * 
 * Demonstrates the simple expression language with evaluation and pretty printing.
 */

import { lit, add, mul, evalExpr, printExpr } from '../types';

export function demonstrateExpressionDSL() {
  console.log('=== Expression DSL Demo ===\n');
  
  // Create a complex expression: (2 * 3) + 4
  const example = add(mul(lit(2), lit(3)), lit(4));
  
  console.log('Expression:', printExpr(example));
  console.log('Result:', evalExpr(example));
  console.log();
  
  // More complex example: ((1 + 2) * 3) + (4 * 5)
  const complex = add(
    mul(add(lit(1), lit(2)), lit(3)),
    mul(lit(4), lit(5))
  );
  
  console.log('Complex expression:', printExpr(complex));
  console.log('Result:', evalExpr(complex));
  console.log();
  
  // Show how the AST structure works
  console.log('AST structure:');
  console.log(JSON.stringify(complex, null, 2));
}

// Run the demo
if (require.main === module) {
  demonstrateExpressionDSL();
}
