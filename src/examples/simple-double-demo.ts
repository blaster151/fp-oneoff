// simple-double-demo.ts
// Simple demonstration of double category functionality

import { DoubleFunctor } from "../types/index.js";

console.log("=== SIMPLE DOUBLE CATEGORY DEMO ===");

try {
  // Create simple finite sets
  const A = new DoubleFunctor.Finite([0, 1]);
  const B = new DoubleFunctor.Finite(['x', 'y']);
  const A1 = new DoubleFunctor.Finite(['a0', 'a1']);
  const B1 = new DoubleFunctor.Finite(['bx', 'by']);
  
  console.log("✓ Finite sets created");
  
  // Create a simple relation
  const R = DoubleFunctor.Rel.fromPairs(A, B, [[0, 'x'], [1, 'y']]);
  console.log("✓ Relation R created:", R.toPairs());
  
  // Create vertical functions
  const f = (n: number) => n === 0 ? 'a0' : 'a1';
  const g = (s: string) => s === 'x' ? 'bx' : 'by';
  
  // Create a square
  const square = DoubleFunctor.mkSquare(A, B, A1, B1, f, R, g);
  console.log("✓ Square created");
  
  DoubleFunctor.printSquare(square, "Test square");
  
  // Test bijection
  const bij = DoubleFunctor.createTestBijection(A, A1, new Map([[0, 'a0'], [1, 'a1']]));
  console.log("✓ Bijection created and verified");
  
  // Create renaming double functor
  const F = new DoubleFunctor.RenamingDoubleFunctor();
  const bijB = DoubleFunctor.createTestBijection(B, B1, new Map([['x', 'bx'], ['y', 'by']]));
  
  F.addObject(A, A1, bij as any);
  F.addObject(B, B1, bijB as any);
  
  console.log("✓ Renaming double functor created");
  
  // Apply functor to square
  const imageSquare = F.onSquare(square);
  console.log("✓ Square mapped through functor");
  console.log("Image square is valid:", DoubleFunctor.squareHolds(imageSquare));
  
  console.log("\n✅ Double category basics working!");
  console.log("✓ Square construction and verification");
  console.log("✓ Bijective double functor mapping");
  console.log("✓ Square preservation under functors");
  
} catch (error) {
  console.log("❌ Error:", error);
  console.log("Stack:", (error as Error).stack);
}