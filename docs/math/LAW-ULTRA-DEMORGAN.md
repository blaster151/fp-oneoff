---
id: LAW-ULTRA-DEMORGAN
title: De Morgan for U via naturality
source:
  - type: slide
    where: "Ultrafilters slides, 'De Morgan laws'"
    pages: [13]
  - type: book
    where: "Halmos (1974), Naive Set Theory"
    pages: [15-16]
    note: "De Morgan laws for Boolean operations"
---

**Laws (LaTeX).**
$$
U(S\cup T) \;=\; U(S)\vee U(T),\qquad
U(A\setminus S) \;=\; \neg U(S).
$$

**Extended De Morgan (LaTeX).**
$$
\neg(S \cup T) = (\neg S) \cap (\neg T), \qquad
\neg(S \cap T) = (\neg S) \cup (\neg T).
$$

**Categorical Derivation.**
1. Union: $\lor \circ \langle\chi_S, \chi_T\rangle = \chi_{S \cup T}$
2. Complement: $\neg \circ \chi_S = \chi_{A \setminus S}$
3. De Morgan: $\lor \equiv \neg(\land \circ \langle\neg, \neg\rangle)$

**Test Hook.**
`src/types/__tests__/ultrafilter-demorgan.test.ts` - De Morgan laws via naturality

**Implementation Files.**
- `src/types/mini-finset.ts` - `or2`, `not2`, Boolean morphisms
- `src/types/ultrafilter-nat-bridge.ts` - `deriveUnionLaw`

**Future Unlocks.**
- Boolean algebra homomorphisms and Stone spaces
- Ultrafilter limits and convergence in topological spaces
- Stone–Čech compactification construction