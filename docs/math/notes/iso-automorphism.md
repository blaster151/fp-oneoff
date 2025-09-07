# Isomorphism classes & automorphisms for finite groups

- **Motivation (Smith §2.8)**: "Identical up to isomorphism" = same multiplication table
  modulo relabeling of elements. Distinct presentations (numbers vs. symmetries) can be
  *structurally the same*.

## Code artifacts

- `CanonicalTable.ts` — relabel & canonicalize (lexicographically minimal rep).
- `IsoClass.ts` — stable `key` to test equality of isomorphism classes.
- `StandardGroups.ts` — constructors: `V4`, `Cn(n)`.
- `Dihedral.ts` — `Dn(n)` via (rotation-power, flip) encoding.
- `Automorphism.ts` — `automorphisms(table)`: permutations preserving the table;
  `autGroupTable`: group law = composition.
- `Catalog.ts` — map canonical keys to friendly names.

## Caveats

- Canonicalization / automorphism search are **factorial-time**; intended for n ≤ 8.
  For larger groups, use structure-specific algorithms (e.g., `Aut(C_n) ≅ (ℤ/nℤ)^×`).

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

*Sources:* Smith, *Introduction to Category Theory*, §2.5–§2.8.