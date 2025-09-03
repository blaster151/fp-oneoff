---
id: THM-EM-ALGEBRA
title: Eilenberg-Moore algebras for monads
source:
  - type: paper
    where: "Manes (1976), Algebraic Theories"
    pages: [45-60]
  - type: book
    where: "Mac Lane (1998), Categories for the Working Mathematician"
    pages: [147-150]
---

**Statement (LaTeX).**
For monad $(T, \eta, \mu)$, an Eilenberg-Moore algebra is $(A, \alpha: T(A) \to A)$ satisfying:
$$
\begin{align}
\alpha \circ \eta_A &= \text{id}_A \\
\alpha \circ T(\alpha) &= \alpha \circ \mu_A
\end{align}
$$

**Special Case: Ultrafilter Monad.**
For finite discrete space $X$, the EM algebra structure map $\alpha: U(X) \to X$ picks the principal witness, and the carrier $X$ inherits compact Hausdorff topology.

**Manes Theorem.**
Eilenberg-Moore algebras for the ultrafilter monad correspond bijectively to compact Hausdorff spaces.

**Implications (TypeScript).**
- `EMAlgebra<A> = { Aset: SetObj<A>; alpha: (t: any) => A }`
- `discreteEMAlgebra<A>(Aset)` constructs canonical discrete algebra
- `checkEMLaws<A>(alg)` verifies unit and associativity laws
- Topological properties: `isT0`, `isHausdorff`, `isCompact`

**Test Hooks.**
- `src/types/__tests__/em-algebra-discrete.test.ts` - EM algebra laws
- Structural verification of unit and associativity

**Future Unlocks.**
- Stone duality between Boolean algebras and Stone spaces
- Compact Hausdorff spaces via EM algebras
- Applications to functional analysis and measure theory
- Topological algebra and continuous lattices