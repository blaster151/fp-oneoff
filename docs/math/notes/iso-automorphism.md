# Group Isomorphisms and Automorphisms (Smith §2.5–2.6)

**Definition.** A group isomorphism is a bijective homomorphism \(f:G\to H\).
If such an \(f\) exists, write \(G\cong H\). An automorphism is an isomorphism \(f:G\to G\).

**Theorem (Two-sided inverse characterization).**
A homomorphism \(f:G\to H\) is an isomorphism iff there exists a homomorphism \(g:H\to G\)
such that \(g\circ f = \mathrm{id}_G\) and \(f\circ g = \mathrm{id}_H\).

**Operationalization.**
- `Group`, `GroupHom`, `GroupIso` with witnesses of left/right inverse laws.
- `isIsomorphismByInverse` checks the theorem for finite groups exhaustively.
- Examples baked as tests: two-element groups iso; Aut(ℤ,+) = {id, neg}; Aut(ℚ,+) contains scalings.

*Source:* Smith, *Introduction to Category Theory*, §2.5–§2.6 (page with "Isomorphisms, automorphisms").

## Identical up to isomorphism (Smith §2.8–2.9)

- **Identical up to isomorphism.** Groups \(K_1,K_2,K_3\) (our Klein four-groups) are
  *identical up to isomorphism*: though one may use numbers and another symmetries of a rectangle,
  they share the same multiplication table modulo relabeling. Group theory generally ignores
  these "cosmetic" differences.

- **Abstract vs. concrete.**
  - *Concrete Klein group*: built from actual objects with independent natures (e.g. numbers,
    reflections). The multiplication table reflects how those objects interact.
  - *Abstract Klein group*: a purely structural entity, whose elements are just
    "points in the table," lacking non-group-theoretic properties. All that matters are
    their relations as encoded in the group law.

- **Philosophical note.** Saying *"the Klein group is abelian"* abstracts away from particular
  instantiations, speaking instead about the unique structure class \(V_4 \cong \mathbb{Z}_2 \times \mathbb{Z}_2\).
  Debate remains whether such "point-like" elements truly exist or whether they are only
  shorthand for equivalence across presentations.