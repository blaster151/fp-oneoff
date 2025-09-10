# Category of Groups, Monos/Epis, and First Iso Thm (Smith §§2.4–2.9, §4.1)

- `Grp` implements the category with objects finite groups and morphisms homomorphisms.
- Laws tested: identities, associativity.
- Finite recognition: mono ⇔ injective, epi ⇔ surjective.
- First Isomorphism Theorem: for `f:G→H`, `φ: G/ker(f) ≅ im(f)` with factorization `include ∘ φ ∘ q = f`.
- Limits/Colimits: pullback implemented and tested; pushout scaffold.
