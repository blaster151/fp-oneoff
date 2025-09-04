# Oriented Rewrite Systems and Set-level Monads

This module implements **oriented rewrite systems** with canonical normal forms per theory and **set-level monads** from finitary algebraic theories.

## Features

### 1. Oriented Rewrite Systems

**Deterministic normal forms** for algebraic theories:

- **Monoid (assoc + unit)**: Right-associative canonical shapes
  - Flattens by associativity
  - Deletes units
  - Right-associates deterministically (no commutativity)

- **Semilattice (ACI + unit)**: Flattened, sorted, deduplicated
  - Flattens by associativity
  - Sorts arguments (commutativity)
  - Deduplicates (idempotence)
  - Deletes units

### 2. Set-level Monads

**Free-forgetful adjunction** gives monad structure:

- `T(X)` = free T-algebra on finite set X
- **Unit**: `X → T(X)` (inclusion of generators)
- **Multiplication**: `T(T(X)) → T(X)` (evaluation of nested terms)
- **Monad laws** verified on finite sets

## Usage

```typescript
import { 
  monoidNormalForm, 
  semilatticeNormalForm,
  createMonoidSetMonad,
  createSemilatticeSetMonad,
  testMonadLaws
} from "./index";

// Define signatures
const MonSig = { 
  ops: [
    { name: "e", arity: 0 },    // unit
    { name: "mul", arity: 2 }   // multiplication
  ] 
};

// Create normal form functions
const { nf: monoidNF } = monoidNormalForm(MonSig, "mul", "e");

// Normalize terms
const term = App(mul, [x, App(mul, [e, y])]);
const normalized = monoidNF(term); // x * y (unit eliminated, right-associated)

// Create set-level monads
const monad = createMonoidSetMonad<string>();

// Test monad laws
const laws = testMonadLaws(monad, ["a", "b", "c"]);
console.log(laws); // { leftIdentity: true, rightIdentity: true, associativity: true }
```

## Files

- `Rules.ts` - Core rewrite engine with AC(I) normalization
- `Oriented.ts` - Theory-specific normal forms (monoid, semilattice)
- `SetMonad.ts` - Set-level monads from finitary theories
- `demo.ts` - Comprehensive demonstration
- `__tests__/` - Full test coverage (36 tests)

## Theory

### Oriented Rewrite Systems

Given an algebraic theory T, we provide **canonical normal forms** that are:
- **Deterministic**: Same input always produces same output
- **Stable**: Applying normalization twice gives same result
- **Theory-aware**: Respects the specific algebraic laws

### Set-level Monads

From a finitary theory T, the **free-forgetful adjunction**:
```
Free_T : Set → T-Alg
U_T    : T-Alg → Set
```
gives rise to a monad `T = U_T ∘ Free_T` on finite sets.

The monad laws are verified by testing on finite sets, ensuring the mathematical correctness of the implementation.

## Testing

Run the comprehensive test suite:

```bash
npm test src/universal/rewrite/__tests__/
```

Run the demo:

```bash
npx tsx src/universal/rewrite/demo.ts
```

## Implementation Notes

- **Cursor-ready**: Explicit file paths, full contents, tight tests
- **Older-LLM friendly**: Clear structure and comprehensive documentation
- **Type-safe**: Full TypeScript implementation with proper types
- **Well-tested**: 36 tests covering edge cases and robustness
- **Modular**: Clean separation of concerns between rules, normal forms, and monads