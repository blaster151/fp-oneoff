# Small vs Large Categories (Smith §3.1–3.2 "sets vs (virtual) classes")

**Idea.** We distinguish *small* categories (explicitly enumerable objects +
hom-sets) from *large* categories where talk of "all objects" is **plural** (not
materially enumerated). Locally, hom-sets remain tractable (enumerable or
constructible per pair of objects).

**Why.** Mirrors the book's "don't try to eliminate plurals": we allow
`objects: "large"` while still enabling computation on hom-sets.

**Operationalization (TypeScript)**
- `SmallCategory` exports `objects(): Iterable<Obj>` and `hom(a,b)`.
- `LargeCategory` uses `objects: "large"` and still provides `hom(a,b)`.
- `asLarge(C: SmallCategory)` adaptor.
- Law witnesses carried as runtime checks for assoc/identity.

**Examples**
- `FinGrp` (small): explicit finite groups and enumerated hom-sets.
- `Grp` (large): plural class of all groups; hom-sets provided only when
  subfamilies admit enumeration (e.g., finite-to-finite).

*Source:* Smith, *Introduction to Category Theory*, Ch. 3 §3.1–3.2.