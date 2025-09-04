# [REL-GRP-ISO-AUTO-P14] Group isomorphisms & automorphisms

**Source**: Smith, *Category Theory*, p. 14 (Section 2.5).  
**Scope**: Isomorphisms, automorphisms, examples.

## Core statement (LaTeX)
A **group isomorphism** \( f: G \xrightarrow{\;\cong\;} H \) is a homomorphism such that
\[
f \text{ is bijective}.
\]
If such an \( f \) exists, we write \( G \cong H \).

A **group automorphism** is an isomorphism \( f: G \xrightarrow{\;\cong\;} G \).

## Examples
1. Any two 2-object groups are isomorphic (trivial isomorphism).
2. Automorphisms of \((\mathbb Z,+)\): identity and \(j \mapsto -j\).
3. Infinitely many automorphisms of \((\mathbb Q,+)\): for each nonzero rational \(q\),  
   \( f_q(x) = qx \).
4. Nontrivial finite example:  
   \( K_2 = \{1,3,5,7\} \subseteq \mathbb Z_8^\times \) under multiplication  
   is isomorphic to \( K_3 \), the dihedral group of rectangle symmetries.

## Code links
- `src/structures/group/Isomorphism.ts` — defines `isIsomorphism`, `autoGroup(G)`
- `src/structures/group/FiniteGroups.ts` — concrete groups like \( \mathbb Z_8^\times \)
- `src/structures/group/GeometryGroups.ts` — dihedral rectangle group ops
- `src/structures/group/homs/Examples25.ts` — the four worked examples

## Tests
- `src/structures/group/__tests__/isomorphism_examples.test.ts`
  - Verifies bijectivity + hom property
  - Confirms `Auto(Z)` contains id and negation
  - Samples \( f_q \) for rational \(q\)
  - Confirms isomorphism between \(K_2\) and \(K_3\) via multiplication/composition tables

## Design implications / unlocks
- **Structural equivalence**: establishes when groups "are the same up to relabeling."
- **Automorphism groups**: paves the way for \(\mathrm{Aut}(G)\) as an object in **Grp**.
- **Representation**: links abstract algebra (multiplicative mod 8) to geometry (rectangle symmetries).

## "Watch later" notes
- Generalize to **Aut(G)** as a group under composition.
- Build tools for **isomorphism search** (bijection finder for finite groups).
- Connect to **functorial invariants**: properties preserved by isomorphism.

## Trace keys
- **Relates to**: `[REL-GRP-HOMS-P12-13]` (homomorphisms)  
- **Enables**: `[REL-GRP-ISO-THM]` (First Isomorphism Theorem)  
- **Depends on**: group axioms, hom definitions, bijectivity checker