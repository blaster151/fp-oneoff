# Mono/Epi/Iso in **Set**

**Facts.** In the category **Set**:
- Monomorphisms are exactly **injective** functions.
- Epimorphisms are exactly **surjective** functions.
- Isomorphisms are exactly **bijections**, i.e. functions with two-sided inverses.

**Operationalization.**
- `src/cat/set/SetCat.ts`
  - `setHom` constructs a morphism and computes witnesses:
    `{ injective, surjective, bijective, isMono, isEpi, inverse? }`.
- Tests demonstrate injective-not-surjective, surjective-not-injective, and bijection with inverse.

*(General textbook folklore; aligns with Smith §2.5–§2.6 style of mono/epi/iso recharacterizations.)*