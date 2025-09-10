# Small vs Large Categories: Plural Talk Implementation

## Core Distinction

**Small Categories**: Explicit enumeration of objects and hom-sets
- `objects(): Iterable<Obj>` - can enumerate all objects
- `hom(a, b): Iterable<Mor>` - can enumerate all morphisms between specific objects
- Represents "set talk" - treating the category as a concrete mathematical object

**Large Categories**: Virtual/plural objects with local computability
- `objects: "large"` - marker for "plural talk"
- `hom(a, b): Iterable<Mor>` - still enumerable on demand for specific objects
- Represents "plural talk" - linguistic convenience without reifying infinite collections

## Implementation

### Core Types (`src/category/core.ts`)
- `BaseCategory`: Common interface with equality, domain/codomain, identity, composition
- `SmallCategory`: Extends with explicit object enumeration
- `LargeCategory`: Extends with "large" marker for plural modeling
- `isSmall()`, `isLarge()`: Type guards for runtime discrimination
- `asLarge()`: Adapter to view small categories as large

### Examples

**FinGrp** (`src/examples/fingrp.ts`): Small category of finite groups
- Explicitly enumerates demo groups (C2, V4)
- Computes all homomorphisms between any two groups
- Demonstrates "set talk" - concrete enumeration

**Grp** (`src/examples/grp-large.ts`): Large category of groups
- Cannot enumerate all groups (infinite)
- Still computes hom-sets on demand for specific groups
- Demonstrates "plural talk" - virtual/linguistic modeling

## Mathematical Foundation

This implements Quine's "virtual theory of classes" and Kunen's approach to proper classes:
- **Plural talk** is harmless linguistic convenience
- **No metaphysical weight** - we don't reify infinite collections
- **Local computability** - can still compute with specific objects
- **Safe substitution** - can switch between set talk and plural talk as needed

## Operational Benefits

1. **Dual-track APIs**: Some functions work with explicit enumeration, others with on-demand computation
2. **Large category support**: Can model categories like Grp, Set, Top without pretending to enumerate them
3. **Type safety**: Compile-time distinction between small and large categories
4. **Extensibility**: Easy to add new small/large category instances

## Future Applications

- **Presheaf categories**: Large categories with locally small hom-sets
- **Functor categories**: [C, D] where C or D might be large
- **Adjoint functors**: Between large categories
- **Topos theory**: Large categories with additional structure

## Source

Smith, *Introduction to Category Theory*, §3.1-3.2 (Sets and (virtual) classes)