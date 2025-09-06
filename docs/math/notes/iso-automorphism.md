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

## Categorical Bridge: The Big Move from Elements to Arrows

**The Fundamental Shift:**
Properties first defined in terms of *objects* (like injectivity = one-to-one on elements) get redefined in terms of *morphisms* (how arrows interact with other arrows). This shift is the *big move* in category theory.

**Key Insight:**
- **Element-based**: "Injective = one-to-one on elements"
- **Arrow-based**: "Monomorphism = left-cancellable morphism"

**Categorical Re-characterization:**
- **Injective homomorphisms**: At the set level, injective ↔ left-invertible. But in groups, the converse doesn't always hold.
- **Example**: $f: (\mathbb{Z}, +, 0) \to (\mathbb{R}, +, 0), f(n) = n$ is injective, but has **no left-inverse homomorphism** (because there's no way to map arbitrary reals back into integers while preserving group structure).
- **Solution**: Instead of saying "injective = has left inverse," category theory says: **Injective = left-cancellable**.

**The General Pattern:**
- Injective ↔ Monomorphism (left-cancellable)
- Surjective ↔ Epimorphism (right-cancellable)  
- Bijective ↔ Isomorphism (two-sided invertible)

**Why This Matters:**
- **From elements to arrows**: This is the exact point where category theory generalizes injectivity *without needing elements*.
- You no longer need to talk about "picking apart sets" — only about *composition of arrows*.
- **Monomorphism = morphism that can't "collapse" different arrows into the same result.**

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

**Categorical Bridge: From Elements to Arrows:**
- `isMonomorphismCategorical` implements left-cancellability: f ∘ g = f ∘ h implies g = h.
- `isEpimorphismCategorical` implements right-cancellability: g ∘ f = h ∘ f implies g = h.
- `composeHomomorphisms` and `homomorphismsEqual` provide arrow composition utilities.
- `createCategoricalBridge` demonstrates the shift from element-based to arrow-based properties.
- Bridge validation confirms element-based === arrow-based for groups (generalizes to any category).

**Examples:**
- Two-element groups are isomorphic.
- Aut(ℤ,+) = {id, neg} (identity and negation).
- Aut(ℚ,+) contains scalings by nonzero rationals.

*Source:* Smith, *Introduction to Category Theory*, §2.5–§2.6 (page with "Isomorphisms, automorphisms").