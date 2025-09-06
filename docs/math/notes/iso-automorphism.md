# Group Isomorphisms and Automorphisms (Smith §2.5–2.6)

**Definition.** A group isomorphism is a bijective homomorphism \(f:G\to H\).
If such an \(f\) exists, write \(G\cong H\). An automorphism is an isomorphism \(f:G\to G\).

**Theorem (Two-sided inverse characterization).**
A homomorphism \(f:G\to H\) is an isomorphism iff there exists a homomorphism \(g:H\to G\)
such that \(g\circ f = \mathrm{id}_G\) and \(f\circ g = \mathrm{id}_H\).

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
- `isIsomorphismByInverse` checks the theorem for finite groups exhaustively.

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

**Examples:**
- Two-element groups are isomorphic.
- Aut(ℤ,+) = {id, neg} (identity and negation).
- Aut(ℚ,+) contains scalings by nonzero rationals.

*Source:* Smith, *Introduction to Category Theory*, §2.5–§2.6 (page with "Isomorphisms, automorphisms").