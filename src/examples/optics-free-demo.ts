/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { OpticsFree } from '../types';

// -------------------------------------------------------------------------------------
// Tiny demo: a Lens, a Prism, a Traversal, and a Free-based mini DSL
// -------------------------------------------------------------------------------------

// Lens over nested record
type Person = { name: { first: string; last: string }; age: number };

const _first = OpticsFree.lensFree(
  (p: Person) => p.name.first,
  (p: Person, b: string) => ({ ...p, name: { ...p.name, first: b } })
);

// Prism over Either<number, string> that focuses the string
const _RightString = OpticsFree.prismFree(
  (e: { _tag: 'Left'; left: number } | { _tag: 'Right'; right: string }) => 
    e._tag === 'Right' ? OpticsFree.leftFree(e.right) : OpticsFree.rightFree(e),  // Left focus carries A
  (s: string) => OpticsFree.rightFree<number, string>(s)
);

// Traversal over array elements
const _each = OpticsFree.eachFree<any, any>();

// Free "ExprF" DSL
type ExprFOptics<A> =
  | { _tag: 'Const'; n: number }
  | { _tag: 'Add';   l: A; r: A };

const ConstOptics = (n: number): OpticsFree.FreeOptics<OpticsFree.URI_ExprF, number> =>
  OpticsFree.liftFOptics<OpticsFree.URI_ExprF, number>(OpticsFree.ExprFFunctorOptics)({ _tag:'Const', n });

const AddOptics = (l: OpticsFree.FreeOptics<OpticsFree.URI_ExprF, number>, r: OpticsFree.FreeOptics<OpticsFree.URI_ExprF, number>): OpticsFree.FreeOptics<OpticsFree.URI_ExprF, number> =>
  ({ _tag:'Suspend', fa: { _tag:'Add', l, r } });

// Algebra to evaluate expressions
const evalAlgOptics = (fa: ExprFOptics<number>): number =>
  fa._tag === 'Const' ? fa.n : (fa.l + fa.r);

const evalExprOptics = OpticsFree.foldFreeOptics(OpticsFree.ExprFFunctorOptics)<number>(evalAlgOptics);

function demonstrateOpticsFree() {
  console.log('=== Optics-Free Demo ===');
  
  // Example usage
  const p: Person = { name:{first:'jeff', last:'o.'}, age:50 };
  
  console.log('Original person:', p);
  console.log('First name:', OpticsFree.viewFree(_first)(p));                               // "jeff"
  
  const updatedPerson = OpticsFree.setFree(_first, 'Jeff')(p);                        // updates first name
  console.log('Updated person:', updatedPerson);
  
  const numbers = [1, 2, 3];
  // Note: Traversal support is still being worked on
  console.log('Original numbers:', numbers);
  console.log('Traversal example: overFree(_each, (x: number) => x + 1)(numbers) would give [2,3,4]');
  
  const expr = AddOptics(ConstOptics(2), AddOptics(ConstOptics(3), ConstOptics(5)));
  const result = evalExprOptics(expr);                                // 10
  console.log('Expression result:', result);
  
  console.log('\n=== How these pieces click together ===');
  console.log('• Lenses provide lawful get/set operations on nested data');
  console.log('• Prisms handle optional/sum types with preview/view');
  console.log('• Traversals operate on collections with over/each');
  console.log('• Free monads enable building interpretable DSLs');
  console.log('• Profunctor encoding ensures composition and laws');
}

// Run the demo
if (require.main === module) {
  demonstrateOpticsFree();
}
