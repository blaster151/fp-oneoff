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

*Sources:* Smith, *Introduction to Category Theory*, §2.5–§2.8.