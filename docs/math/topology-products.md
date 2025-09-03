# Product topology (collection)

## [TOP-PRODUCT-CONT]
id: TOP-PRODUCT-CONT
tags: [topology, product]
source: standard:"Product is initial wrt projections"
---
**Statement**  
Projections are continuous; \(f:Z\to X\times Y\) is continuous iff \(\pi_1\circ f,\pi_2\circ f\) are.

**Implications (TS)**  
- `productTopology`, `pr1`, `pr2`, continuity tests.
- Basic rectangles U×V generate product topology.
- Universal property: factorization through product.

**Test hook**  
`src/types/__tests__/topology-product.test.ts`

**Future unlocks**  
- Finite products of n factors; Stone spaces later.
- Infinite products via Tychonoff theorem (requires choice).
- Exponential objects in topological categories.
- Cartesian closed structure for nice topological spaces.
- Applications to locale theory and pointless topology.

## [THM-EM-ALGEBRA]
id: THM-EM-ALGEBRA
tags: [monad, algebra, topology]
source: canonical:"Manes theorem on compact Hausdorff"
---
**Statement**  
For monad \((T, \eta, \mu)\), EM algebra is \((A, \alpha: T(A) \to A)\) with \(\alpha \circ \eta = \text{id}\), \(\alpha \circ T(\alpha) = \alpha \circ \mu\).

**Special Case**  
For ultrafilter monad on finite discrete space, α picks principal witness.

**Implications (TS)**  
- `EMAlgebra<A>` interface with structure map.
- `discreteEMAlgebra<A>(Aset)` constructs canonical discrete algebra.
- Topological properties via EM algebra structure.

**Future unlocks**  
- Stone duality between Boolean algebras and Stone spaces.
- Compact Hausdorff spaces via EM algebras.
- Applications to functional analysis and measure theory.

## [LAW-NATURALITY]
id: LAW-NATURALITY
tags: [naturality, functors]
source: canonical:"Natural transformation commutative squares"
---
**Law**  
For natural transformation \(\alpha: F \Rightarrow G\): \(\alpha_B \circ F(f) = G(f) \circ \alpha_A\).

**Implications (TS)**  
- Naturality verification in end constructions.
- Boolean algebra laws via naturality squares.
- Dinaturality constraints in end/coend computations.

**Future unlocks**  
- 2-categories and higher naturality.
- Enriched natural transformations.
- Applications to homotopy theory.

## [THM-STONE-DUALITY]
id: THM-STONE-DUALITY
tags: [stone, boolean, topology]
source: canonical:"Stone representation theorem"
---
**Statement**  
Categories of Boolean algebras and Stone spaces are dually equivalent: \(\mathbf{Bool}^{\text{op}} \simeq \mathbf{Stone}\).

**Current Implementation**  
- Finite Boolean algebras via `MiniFinSet` morphisms.
- Ultrafilter construction via codensity monad.
- Discrete topology on finite sets.

**Future unlocks**  
- Infinite Stone spaces and Boolean algebras.
- Spectral topology and prime ideal spaces.
- Applications to logic and model theory.
- Locale theory and pointless topology.
- Stone–Čech compactification.
- Boolean-valued models in set theory.