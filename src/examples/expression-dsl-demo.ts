/**
 * Expression DSL Demo
 * 
 * Demonstrates building an interpretable expression language using Free monads.
 * This shows how to create domain-specific languages with lawful, composable programs.
 */

import { 
  ExprFFunctor, 
  Const, 
  Add, 
  evalExprAlg, 
  printExprAlg, 
  foldFree 
} from '../types';

export function demonstrateExpressionDSL() {
  console.log('=== Expression DSL Demo ===');
  
  // Create interpreters using the algebras
  const evalExpr = foldFree(ExprFFunctor, evalExprAlg)
  const printExpr = foldFree(ExprFFunctor, printExprAlg)
  
  // Basic usage
  const expr = Add(Const(2), Add(Const(3), Const(5))) // 2 + (3 + 5)
  const result = evalExpr(expr) // 10
  const printed = printExpr(expr) // "(2 + (3 + 5))"
  
  console.log('Expression:', printed);
  console.log('Result:', result);
  
  // More complex example
  const complexExpr = Add(
    Add(Const(1), Const(2)),  // (1 + 2)
    Add(Const(3), Const(4))   // (3 + 4)
  )
  const complexResult = evalExpr(complexExpr)
  const complexPrinted = printExpr(complexExpr)
  
  console.log('\nComplex expression:', complexPrinted);
  console.log('Result:', complexResult);
  
  // Nested expressions
  const nestedExpr = Add(
    Const(10),
    Add(
      Add(Const(5), Const(3)),  // (5 + 3)
      Add(Const(2), Const(1))   // (2 + 1)
    )
  )
  const nestedResult = evalExpr(nestedExpr)
  const nestedPrinted = printExpr(nestedExpr)
  
  console.log('\nNested expression:', nestedPrinted);
  console.log('Result:', nestedResult);
  
  console.log('\n=== How these pieces click together ===');
  console.log('• Free monads let you build interpretable, law-carrying programs');
  console.log('• Different algebras (eval, print) can interpret the same AST');
  console.log('• The functor instance ensures proper structure preservation');
  console.log('• Smart constructors provide a clean API for building expressions');
}

// Run the demo
if (require.main === module) {
  demonstrateExpressionDSL();
}
