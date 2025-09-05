# Laws Framework

A comprehensive framework for testing mathematical structures and their properties through systematic law verification.

## Overview

The laws framework provides a systematic way to verify that mathematical structures satisfy their required axioms and properties. It supports:

- **Single-structure laws**: Monoids, posets, lattices, etc.
- **Two-sided equivalences**: Isomorphisms, adjunctions, natural transformations
- **Centralized registry**: Manage and run all law verifications
- **Witness generation**: Optional counterexample production for failed laws

## Core Components

### 1. Witness System (`Witness.ts`)

**Core Types:**
- `Law<E>`: Named predicate over environment E
- `Lawful<A,S>`: Structure bundle with laws
- `Iso<A,B>`: Two-sided equivalence with round-trip laws
- `runLaws()`: Execute laws and collect failures

**Example:**
```typescript
const laws = [
  {
    name: "associativity",
    check: ({M, xs}) => xs.every(a => xs.every(b => xs.every(c =>
      eq(M.concat(M.concat(a,b), c), M.concat(a, M.concat(b,c)))
    )))
  }
];
const result = runLaws(laws, { M: monoid, xs: samples });
```

### 2. Law Generators

**Monoid Laws** (`Monoid.ts`):
- Associativity: `(a·b)·c = a·(b·c)`
- Left identity: `e·a = a`
- Right identity: `a·e = a`

**Order Laws** (`Order.ts`):
- Poset axioms: Reflexivity, antisymmetry, transitivity
- Lattice properties: Join/meet as lub/glb
- Fixed point laws: `f(lfp f) = lfp f`

**Isomorphism Laws** (`Witness.ts`):
- Round-trip: `to(from(b)) = b` and `from(to(a)) = a`

### 3. Registry System (`registry.ts`)

**Centralized Management:**
```typescript
import { registerLawful, runAll } from "./registry";

// Register a law pack
registerLawful(lawfulMonoid("Monoid/number/sum", eq, monoid, samples));

// Run all registered laws
const report = runAll();
```

## Usage Patterns

### Single-Structure Laws

```typescript
import { lawfulMonoid } from "./Monoid";

const eq = (a: number, b: number) => a === b;
const Sum = { empty: 0, concat: (x: number, y: number) => x + y };
const pack = lawfulMonoid("Monoid/number/sum", eq, Sum, [0, 1, 2, 3]);

// Test the laws
const result = runLaws(pack.laws, { M: pack.struct, xs: [0, 1, 2, 3] });
expect(result.ok).toBe(true);
```

### Two-Sided Equivalences

```typescript
import { isoLaws } from "./Witness";

const iso = {
  to: (a: A) => /* convert A to B */,
  from: (b: B) => /* convert B to A */
};

const laws = isoLaws(eqA, eqB, iso);
const result = runLaws(laws, { samplesA: [...], samplesB: [...] });
```

### Codensity Equivalence Example

```typescript
import { lawfulCodensityIso } from "./examples/CodensityNat";

const pack = {
  to: (tga: TGA) => nat,
  from: (nt: Nat) => tga,
  eqT: eqTGA,
  eqN: eqNat,
  sampleT: [...],
  sampleN: [...]
};

const lawPack = lawfulCodensityIso(pack);
registerLawful(lawPack);
```

## Registry Management

### Registering Law Packs

```typescript
// In packs.ts or your module
import { registerLawful } from "./registry";

// Single structure
registerLawful(lawfulMonoid("Monoid/string/concat", eq, concat, samples));

// Two-sided equivalence
registerLawful(lawfulCodensityIso(codensityPack));
```

### Running All Laws

```typescript
import { runAll } from "./registry";

const report = runAll();
const failures = report.filter(r => !r.ok);

if (failures.length > 0) {
  console.log("Law failures:", failures);
}
```

### Test Integration

```typescript
import { describe, it, expect } from "vitest";
import "../packs"; // side-effect: registers packs
import { runAll } from "../registry";

describe("All law packs", () => {
  it("every registered pack satisfies its laws", () => {
    const report = runAll();
    const failures = report.filter(r => !r.ok);
    expect(failures.length).toBe(0);
  });
});
```

## Mathematical Structures Supported

### Algebraic Structures
- **Monoids**: Associativity, identity
- **Groups**: Monoid + inverse
- **Rings**: Additive/multiplicative monoid + distributivity
- **Fields**: Ring + multiplicative inverse

### Order-Theoretic Structures
- **Posets**: Reflexivity, antisymmetry, transitivity
- **Lattices**: Join/meet properties
- **Complete Lattices**: Supremum/infimum properties
- **CPOs**: Domain-theoretic properties

### Categorical Structures
- **Functors**: Identity and composition preservation
- **Natural Transformations**: Naturality laws
- **Adjunctions**: Unit/counit or hom-set bijection
- **Monads**: Unit and associativity

### Equivalences
- **Isomorphisms**: Two-sided round-trip laws
- **Equivalences**: Weaker than isomorphisms
- **Galois Connections**: Adjoint properties

## Examples

See the `examples/` directory for concrete implementations:

- **Ring Laws**: Multiplicative monoid verification
- **Divisibility Posets**: Number theory orderings
- **CRT Isomorphisms**: Chinese Remainder Theorem
- **Powerset Lattices**: Boolean algebra properties
- **Codensity Equivalence**: T^G(A) ≅ Nat(G^A, G)

## Best Practices

1. **Use specific law generators** when available (e.g., `monoidLaws`, `posetLaws`)
2. **Provide meaningful samples** for law verification
3. **Include witness generation** for debugging failed laws
4. **Register law packs** in a central location (`packs.ts`)
5. **Test both directions** for equivalences and isomorphisms
6. **Use descriptive tags** for law pack identification

## Extending the Framework

To add new law types:

1. **Create law generators** in appropriate modules
2. **Define witness types** for your structures
3. **Add registry support** if needed
4. **Create examples** and tests
5. **Update documentation**

The framework is designed to be extensible and can accommodate new mathematical structures and their properties as needed.