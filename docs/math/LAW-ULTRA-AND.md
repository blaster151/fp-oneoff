---
id: LAW-ULTRA-AND
title: Intersection law via naturality with and ∘ ⟨χ_S,χ_T⟩
source:
  - type: slide
    where: "Ultrafilters slides, 'Boolean algebra from naturality'"
    pages: [12]
  - type: paper
    where: "Johnstone (1982), Stone Spaces"
    pages: [45-47]
    note: "Boolean algebra structure on ultrafilters"
---

**Law (LaTeX).**
$$
U(S\cap T) \;=\; U(S)\wedge U(T).
$$

For any ultrafilter $U$ and subsets $S, T$, the intersection property holds via categorical naturality.

**Categorical Derivation.**
1. Characteristic functions: $\chi_S : A \to 2$, $\chi_T : A \to 2$
2. Pairing: $\langle\chi_S, \chi_T\rangle : A \to 2 \times 2$
3. Composition: $\land \circ \langle\chi_S, \chi_T\rangle : A \to 2$
4. Naturality: $\alpha_2(\land \circ \langle\chi_S, \chi_T\rangle) = \land(\alpha_{2 \times 2}(\langle\chi_S, \chi_T\rangle))$

**Proof via Naturality.**
Natural transformation component at Boolean object $2$ with morphism $\land : 2 \times 2 \to 2$. The naturality square ensures that Boolean operations commute with ultrafilter evaluation.

**Test Hook.**
`src/types/__tests__/ultrafilter-naturality.test.ts` - intersection law via naturality

**Implementation Files.**
- `src/types/ultrafilter-nat-bridge.ts` - `deriveIntersectionLaw`
- `src/types/mini-finset.ts` - `and2`, `pairTo2x2`, `chi`
- `src/types/codensity-nat-bridge.ts` - `endToNat`

**Witness Laws.**
- Intersection preservation: $\chi_{S \cap T} = \land \circ \langle\chi_S, \chi_T\rangle$
- Naturality constraint: Components commute with Boolean operations
- Ultrafilter property: Closed under finite intersections

**Future Unlocks.**
- Generalization to Boolean algebra homomorphisms
- Stone representation theorem for Boolean algebras
- Ultrafilter convergence in topological spaces
- Boolean-valued models in set theory