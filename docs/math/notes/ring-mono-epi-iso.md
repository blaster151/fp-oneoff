# Mono/Epi/Iso for **finite** rings (unital, commutative)

**Hom definition.** A (unital) ring hom \(f:R\to S\) preserves \(0,1,+,\cdot\).

**What we compute.**
- `injectiveUnderlying`, `surjectiveUnderlying`: properties of the underlying set function.
- `isMono`, `isEpi`: *categorical* left/right-cancellability, computed by probing small rings \(J,K \in \{\mathbb Z/2, \mathbb Z/3, \mathbb Z/4\}\) and enumerating homs.
- `isIso`: we explicitly search for a two-sided inverse hom \(g:S\to R\).

**Remarks.**
- In **finite** settings these usually align with the set-level notions (epis are surjective, monos injective).
- In **general CRing**, epimorphisms need **not** be surjective; our code is honest because it checks cancellability directly, and we also display the set-level surjectivity separately.

**Operationalization.**
- `src/algebra/ring/Ring.ts`: `Zmod(n)`, product ring.
- `src/algebra/ring/Hom.ts`: `ringHom` + analysis witnesses.
- Tests: `Z4 → Z2` (quotient, epi), `id` (iso), product projection (epi in the finite case).

*(Background intuition mirrors Smith §2.5–§2.6's mono/epi/iso lens; categorical facts for rings are subtler, hence dual readouts.)*