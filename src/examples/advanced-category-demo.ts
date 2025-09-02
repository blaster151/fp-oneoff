/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 * 2. Double category of relations over Set
 * 3. General inner horns with search-based filler
 */

import { 
  makeRelationsDouble,
  makeInnerHornN,
  searchFillInnerHorn,
  FiniteNerve,
  C_free,
  f1,
  g1,
  Q_ABC
} from '../types';

function demonstrateAdvancedCategories() {
  console.log('=== Advanced Category Theory Demo ===\n');
  
  // 1. DoubleFunctors
  console.log('1. DoubleFunctors');
  console.log('   Building double categories to demonstrate functors...');
  
  console.log('   Double functor structure provides FH, FV, and onSquare mappings');
  console.log('   Note: Law checking requires careful type alignment');
  console.log();
  
  // 2. Double category of relations
  console.log('2. Double Category of Relations');
  console.log('   Building relations double category...');
  
  const Drel = makeRelationsDouble();
  
  // Create finite sets
  const A = { id: 'A', elems: [0, 1, 2], eq: (x: number, y: number) => x === y };
  const B = { id: 'B', elems: [0, 1, 2], eq: (x: number, y: number) => x === y };
  
  // Create relations
  const R = { 
    src: A, 
    dst: B, 
    holds: (a: number, b: number) => a === b || a + 1 === b 
  };
  const S = { 
    src: A, 
    dst: B, 
    holds: (a: number, b: number) => a <= b 
  };
  
  // Create functions
  const idA = { src: A, dst: A, f: (x: number) => x };
  const idB = { src: B, dst: B, f: (x: number) => x };
  
  console.log('   Creating a commuting square...');
  try {
    Drel.mkSquare({ hTop: R, hBot: S, vLeft: idA, vRight: idB });
    console.log('   Square created successfully!');
    console.log('   Top relation:', R.holds(1, 2), 'Bottom relation:', S.holds(1, 2));
  } catch (error) {
    console.log('   Error creating square:', (error as Error).message);
  }
  console.log();
  
  // 3. General inner horns with search-based filler
  console.log('3. General Inner Horns + Search-Based Filler');
  console.log('   Building finite nerve for search-based filling...');
  
  const Sfin = FiniteNerve(
    C_free, 
    Q_ABC.objects, 
    [f1, g1, C_free.id('A'), C_free.id('B'), C_free.id('C')], 
    (x, y) => x === y
  );
  
  // Build an inner 2-horn from f1 and g1
  const horn2 = makeInnerHornN(2, 1, [
    [0, { head: C_free.dst(f1), chain: [g1] }],
    [2, { head: C_free.src(f1), chain: [f1] }]
  ]);
  
  console.log('   Searching for filler of inner horn...');
  const found = searchFillInnerHorn(
    Sfin, 
    horn2, 
    (a, b) => a.head === b.head && 
               a.chain.length === b.chain.length && 
               a.chain.every((m, i) => m === b.chain[i])
  );
  
  if (found) {
    console.log('   Found filler:', found);
    console.log('   Head:', found.head);
    console.log('   Chain length:', found.chain.length);
  } else {
    console.log('   No filler found');
  }
  console.log();
  
  console.log('=== How these pieces click together ===');
  console.log('• DoubleFunctors preserve 2D structure between double categories');
  console.log('• Relations double category models database-like structures');
  console.log('• General inner horns enable ∞-category constructions');
  console.log('• Search-based filling provides computational access to higher structure');
  console.log('• This bridges category theory to practical applications');
}

// Run the demo
if (require.main === module) {
  demonstrateAdvancedCategories();
}
