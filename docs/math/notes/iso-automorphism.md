# Group Isomorphisms and Automorphisms (Smith §2.5–2.6)

**Definition.** A group isomorphism is a bijective homomorphism \(f:G\to H\).
If such an \(f\) exists, write \(G\cong H\). An automorphism is an isomorphism \(f:G\to G\).

**Theorem 4 (Two-sided inverse characterization).**
A homomorphism \(f:G\to H\) is an isomorphism iff there exists a homomorphism \(g:H\to G\)
such that \(g\circ f = \mathrm{id}_G\) and \(f\circ g = \mathrm{id}_H\).

**Key Insight:** This reframes isomorphism *not in terms of injectivity/surjectivity*, but purely in terms of invertibility. In categorical terms, this generalizes: in **any category**, an isomorphism is a morphism with a two-sided inverse. This theorem is the pivot point from **Grp** to general **Cat**.

## Proof-Driven Implementation

**Core Proof Insight:**
1. **Forward direction**: If $f : G \to H$ is a group isomorphism, then $f$ is bijective. So it has a two-sided inverse function $g$. We only need to check: is $g$ itself a homomorphism?
2. **Converse direction**: If $f$ has a two-sided inverse $g$, then as a function between sets $f$ must be a bijection. And since it was given as a homomorphism, that's enough to conclude $f$ is an isomorphism.

**Operational Translation:**
- The check isn't about *guessing bijection properties directly* — it's about constructing the inverse and verifying that it's a homomorphism.
- This matches the category-theory perspective: isomorphism = morphism with a two-sided inverse morphism.
- The whole point is to remove "bijectivity" from the *definition* and relegate it to a consequence of invertibility.

**Runtime Law Enforcement:**
- `checkIsInverse` implements the proof steps: operation preservation + round-trip laws.
- `tryBuildInverse` automatically constructs inverse via brute-force inversion over finite sets.
- `createProofWorkflow` mechanically derives isomorphisms following the complete proof flow.
- The substrate doesn't just "store" isomorphisms, it **re-derives them mechanically**.

## Categorical Foundations

**Theorem 3 – Isomorphism is an equivalence relation**
- **Reflexive**: every group is isomorphic to itself via the identity map.
- **Symmetric**: if \(f: G \to H\) is an isomorphism, then \(f^{-1}: H \to G\) is also an isomorphism.
- **Transitive**: if \(G \cong H\) and \(H \cong J\), then \(G \cong J\).

**Theorem 5 – Injectivity vs. Monomorphisms**
- For groups, being an injective homomorphism is equivalent to being a *monomorphism* (left-cancellable morphism).
- This highlights the general-categorical pattern: categorical definitions (mono/epi) specialize in concrete categories (like **Grp**) to familiar set-theoretic conditions (injective/surjective).

**Epimorphisms**
- Dual notion: right-cancellable morphisms. In groups, these are exactly the *surjective* homomorphisms.
- Later, when generalizing to other categories, we'll learn that epi ≠ surjective in some categories (e.g. rings), so it's important to keep the category-relative definition distinct.

## Operationalization

**Core Infrastructure:**
- `Group`, `GroupHom`, `GroupIso` with witnesses of left/right inverse laws.
- `InverseWitness<A, B>` interface encoding the two-sided inverse characterization.
- `makeInverseWitness` creates witnesses by checking round-trip laws.
- `isIsomorphismByInverse` validates witnesses according to Theorem 4.

**Equivalence Relation Infrastructure:**
- `EquivalenceWitness<A>` interface for reflexive/symmetric/transitive properties.
- `isomorphismEquivalenceWitness` auto-derives equivalence relation witnesses for isomorphisms.
- `isEquivalenceRelation` generic checker for any equivalence relation.

**Categorical Characterizations:**
- `isMonomorphism` checks injectivity (left-cancellability).
- `isEpimorphism` checks surjectivity (right-cancellability).
- `isIsomorphism` = monomorphism + epimorphism.

**Witness Pack System:**
- `HomomorphismWitness` auto-derives all categorical properties from a homomorphism.
- `GroupWitness` auto-derives group properties (associativity, commutativity, order).
- `deriveHomomorphismWitness` and `deriveGroupWitness` provide complete categorical analysis.

**Generalization Hook:**
- `Category<A>` interface for general categorical structure.
- `hasInverse` generic function for checking inverse relationships.
- `IsomorphismLawChecker` system requiring proper inverse witnesses.
- `createIsomorphismLawChecker` factory for law validation.

**Proof-Driven Isomorphism Checking:**
- `checkIsInverse` encodes the proof steps: operation preservation + round-trip laws.
- `tryBuildInverse` automatically constructs inverse via brute-force inversion.
- `createProofWorkflow` mechanically derives isomorphisms following the proof flow.
- `ProofWorkflow` interface tracks proof steps: inverse exists, is homomorphism, round-trips valid.

**Examples:**
- Two-element groups are isomorphic.
- Aut(ℤ,+) = {id, neg} (identity and negation).
- Aut(ℚ,+) contains scalings by nonzero rationals.

*Source:* Smith, *Introduction to Category Theory*, §2.5–§2.6 (page with "Isomorphisms, automorphisms").