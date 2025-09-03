---
id: LAW-NATURALITY
title: Naturality condition for natural transformations
source:
  - type: standard
    where: "Category Theory (Awodey, 2010)"
    pages: [58-62]
  - type: book
    where: "Categories for the Working Mathematician (Mac Lane, 1998)"
    pages: [16-18]
---

**Statement (LaTeX).**
For natural transformation $\alpha: F \Rightarrow G$ and morphism $f: A \to B$:
$$
\alpha_B \circ F(f) = G(f) \circ \alpha_A
$$

**Commutative Diagram.**
$$
\begin{CD}
F(A) @>F(f)>> F(B) \\
@V\alpha_A VV @VV\alpha_B V \\
G(A) @>>G(f)> G(B)
\end{CD}
$$

**Applications to Ultrafilters.**
Naturality of ultrafilter evaluation at Boolean objects yields Boolean algebra laws without explicit principal-witness reasoning.

**Implications (TypeScript).**
- `NatTrans<CatB>` interface with `at(b)` components
- Naturality verification in end constructions
- Boolean algebra laws via naturality squares
- Dinaturality constraints in end/coend computations

**Test Hooks.**
- All natural transformation constructions
- End/coend dinaturality verification
- Boolean algebra law derivations

**Future Unlocks.**
- 2-categories and higher naturality
- Enriched natural transformations
- Coherence conditions for higher categories
- Applications to homotopy theory