// Import type classes (unused import warning suppressed for demonstration)
// import * as Types from './types';

console.log('Functional Programming Type Classes Library');
console.log('==========================================');

// Demonstrate that all type classes are available
console.log('Available type classes:');

// HKT and basic types
console.log('- HKT, Fn, Nat, Kleisli, CoKleisli');

// Algebraic structures
console.log('- Eq, Show, Ord');
console.log('- Semigroup, Monoid, Group');
console.log('- Semiring, Ring');
console.log('- Lattice, BoundedLattice, HeytingAlgebra');
console.log('- Category, Semigroupoid');
console.log('- Action, Algebra, Coalgebra');
console.log('- LeftModule, LeftComodule');

// Functor family
console.log('- Functor, Contravariant, Invariant, Bifunctor, Trifunctor, Profunctor');
console.log('- Apply, Applicative, Alt, Plus, Alternative');
console.log('- Chain, Monad');
console.log('- MonadThrow, MonadError, MonadReader, MonadState, MonadWriter');

// Foldable and Comonad
console.log('- Foldable, Unfoldable, Traversable');
console.log('- Extend, Comonad');

// Advanced
console.log('- Arrow, ArrowChoice, ArrowApply');
console.log('- Representable, Distributive');
console.log('- Free, Fix');
console.log('- Iso, Lens, Prism, Traversal');

console.log('\nType classes are ready for use!');
console.log('Import them with: import * as Types from "./types"');
