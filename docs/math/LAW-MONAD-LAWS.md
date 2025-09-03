---
id: LAW-MONAD-LAWS
title: Monad laws (unit, associativity, functoriality)
source:
  - type: standard
    where: "Category Theory (Awodey, 2010)"
    pages: [242-245]
  - type: book
    where: "Categories for the Working Mathematician (Mac Lane, 1998)"
    pages: [138-140]
---

**Laws (LaTeX).**
$$
\begin{align}
\mu \circ \eta_{T(A)} &= \text{id}_{T(A)} \quad \text{(left unit)} \\
\mu \circ T(\eta_A) &= \text{id}_{T(A)} \quad \text{(right unit)} \\
\mu \circ \mu_{T(A)} &= \mu \circ T(\mu_A) \quad \text{(associativity)}
\end{align}
$$

**Kleisli Form.**
$$
\begin{align}
k \circ \eta &= k \\
\eta \circ f &= f \\
(k \circ g) \circ f &= k \circ (g \circ f)
\end{align}
$$

**Implications (TypeScript).**
- `chain(of)(ma) === ma` (left identity)
- `chain(k)(of(a)) === k(a)` (right identity)  
- `chain(h)(chain(g)(ma)) === chain(x => chain(h)(g(x)))(ma)` (associativity)
- Functor laws: `map(id) === id`, `map(g ∘ f) === map(g) ∘ map(f)`

**Test Hooks.**
- `src/types/__tests__/cont.test.ts` - Continuation monad laws
- `src/types/__tests__/codensity-monad.test.ts` - Codensity monad laws
- All monad instances should satisfy these laws

**Future Unlocks.**
- Monad transformers and composition
- Algebraic effects and handlers
- Kleisli categories and enriched monads