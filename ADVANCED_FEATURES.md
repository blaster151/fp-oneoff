# Advanced Homology Features

## Overview

The homology integration in **fp-oneoff** provides sophisticated algebraic topology computation with the following advanced features:

## 🔢 Integral Homology with Torsion

```typescript
const H = Homology.computeHomology01_Z(quiver, { maxPathLen: 2 });
// H.H1 = { rank: number, torsion: number[] }  
// e.g., torsion [2, 4] gives ℤ/2 ⊕ ℤ/4
```

**Internal Algorithm:**
1. Computes SNF of ∂₁ to get a **kernel basis** for C₁
2. Changes basis and restricts ∂₂ to that kernel (matrix **B**)  
3. SNF(B) → invariant factors = **H₁ torsion**, rank = dim ker ∂₁ - rank(B)

## 📊 Rational Ranks Preserved

```typescript
const HQ = Homology.computeHomology01(quiver, { maxPathLen: 2 });
console.log(HQ.betti0, HQ.betti1);
```

Fast rational computation using Gaussian elimination over ℚ for Betti numbers.

## 🔺 General Simplicial Sets

```typescript
const S: Homology.SSet02 = {
  V: ["v0","v1","v2"],
  E: [
    {key:"e01", faces:["v0","v1"]}, 
    {key:"e12", faces:["v1","v2"]}, 
    {key:"e02", faces:["v0","v2"]}
  ],
  T: [
    {key:"t012", faces:["e02","e12","e01"], signs:[+1,+1,-1]}
  ]
};
const HS = Homology.H01_fromSSet_Z(S); // { H0: {rank,...}, H1: {rank, torsion} }
```

**Features:**
- Arbitrary vertex/edge/triangle keys
- Explicit face maps with orientation control
- Direct homology computation without quiver conversion

## 🕳️ Inner-Horn Completeness Check

```typescript
const holes = Homology.missingInnerHorns2(S); // [] if every composable pair is filled
```

Checks for **Λ²₁** (inner 2-horn) completeness - essential for quasi-category structure.

## 🔧 Hardened Smith Normal Form

```typescript
const { U, D, V } = Homology.smithNormalForm(A);   // U*A*V = D (diagonal)
const Vinv = Homology.invUnimodular(V);            // certified unimodular inverse
const cert = Homology.certifySNF(A, U, D, V);      // runtime verification
```

**Properties:**
- **Full divisibility**: D[i] | D[i+1] for all diagonal entries
- **Unimodular certificates**: U, V have integer inverses  
- **Runtime verification**: Checks U*A*V === D exactly

## 📋 H₁ Presentation Output

```typescript
const H = Homology.computeHomology01_Z(quiver);
// H.presentation = {
//   generators: ["g1", "g2", ...],                    // basis of ker ∂₁
//   generatorVectors: { 
//     g1: { "A|B|f": 1, "B|C|g": -1, ... },         // explicit 1-chains
//     ...
//   },
//   relations: ["2 * h1 = 0", ...],                   // torsion relations
//   freeGenerators: [{ name: "h2", coeffs: {...} }], // basis for free part
//   torsionGenerators: [{ name: "h1", coeffs: {...}, order: 2 }], // torsion elements
//   rank: 1, torsion: [2]                            // invariants
// }
```

**Provides:**
- **Explicit generators** as linear combinations of 1-chains
- **Torsion relations** from diagonal entries
- **Pretty-printing** via `prettyChain()` for readable loop descriptions

## 🌉 Category Theory Integration

The system seamlessly bridges:

```
Categories → Nerves → Chain Complexes → Smith Normal Form → H₁ Presentation
```

**Use Cases:**
- **Workflow Analysis**: Detect cycles and bottlenecks in process graphs
- **Compositional Systems**: Analyze connectivity in categorical structures  
- **Topological Invariants**: Compute robust features of complex networks

## 🧪 Demo Results

Running `homology-presentation-demo.ts` shows:

```
=== Square with Diagonal ===
β0,β1 over ℚ: 1 2          // One component, two independent loops
H1 over ℤ: ℤ^2             // Free abelian group, no torsion
SNF diagonal: [1, 1, 1]    // Three independent relations

=== Filled Triangle ===  
H₀: ℤ^1, H₁: ℤ^0          // Contractible (no holes)
Missing horns: 0           // Quasi-category complete
```

## 🚀 Technical Achievements

1. **Type Safety**: Full TypeScript integration with strict null checks
2. **Numerical Stability**: Integer arithmetic throughout (no floating-point errors)
3. **Algorithmic Correctness**: Proper Smith Normal Form with divisibility
4. **Categorical Integration**: Works with existing nerve construction
5. **Educational Value**: Clear connection between algebra and topology

This creates a unique computational environment where category theory meets algebraic topology in a practical, executable framework! 🎯