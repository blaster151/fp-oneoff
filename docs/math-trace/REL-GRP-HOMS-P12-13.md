# [REL-GRP-HOMS-P12-13] Group homomorphisms & Hom-category laws

**Source**: Smith, *Category Theory*, pp. 12–13 (Section 2.4).  
**Scope**: Definition of group homomorphism; examples (4–6); "Hom is a category" (Theorem 2).

## Core statement (LaTeX)
A **group homomorphism** \( f: (G,\star,e) \to (H,\diamond,d) \) satisfies
\[
\forall x,y\in G.\quad f(x\star y)=f(x)\diamond f(y).
\]
Immediate consequences:
\[
f(e)=d,\qquad f(x^{-1})=(f(x))^{-1}.
\]

**Category laws (Theorem 2)**
For homomorphisms \(f:G\to H\), \(g:H\to J\), \(h:J\to K\):
\[
g\circ f: G\to J\ \text{is a hom},\qquad
h\circ(g\circ f)=(h\circ g)\circ f,\qquad
\mathrm{id}_G\circ f=f=f\circ \mathrm{id}_H.
\]

## Code links
- `src/structures/group/GrpCat.ts` — `hom`, `idHom`, `comp`
- `src/structures/group/Isomorphism.ts` — hom/isomorphism utilities
- `src/structures/group/HomHelpers.ts` — `injectiveOn`, `surjectiveTo`
- `src/structures/group/Complex.ts` — \( \mathbb C^\times \) samples
- `src/structures/group/homs/Examples24.ts` — examples (4)–(6)

## Tests
- `src/structures/group/__tests__/theorem2_and_examples.test.ts`
  - Verifies identity & associative composition
  - Example (4): parity \( \mathbb Z \to J \) (surj, not inj)
  - Example (5): \( \mathbb Z \to \mathbb Q \) via \( n\mapsto n/1 \) (inj, not surj)
  - Example (6): \( j(x)=\cos x+i\sin x:\ (\mathbb R,+)\to (\mathbb C^\times,\cdot) \) (hom; neither inj nor surj)

## Design implications / unlocks
- **Functorial glue**: Establishes Hom as a category object ⇒ enables categorical constructions over groups.
- **Testing pattern**: Finite/exhaustive verification for group laws; sampled verification for analytic codomains.
- **Reusability**: Parity hom is a canonical template for quotient-style maps \( G\to G/N \) (foreshadows First Isomorphism Theorem).

## "Watch later" notes
- Formalize arbitrary **quotients** \(G/\!\sim\) (congruences) and factorization of homs through quotients.
- Add fast **Aut(\( \mathbb Z_n\))** via Euler's \( \varphi(n) \) with explicit generators.
- Generalize to **Mon**, **Ab**, and to **Grp** as a **cartesian** category (products, terminal object).

## Trace keys
- **Relates to**: `[REL-GRP-QUOTIENTS-P10-11]` (congruences/quotients)  
- **Enables**: `[REL-GRP-ISO-THM]` (First Isomorphism Theorem)  
- **Depends on**: basic group axioms & finite verification harness