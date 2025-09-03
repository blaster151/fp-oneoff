---
id: THM-CODENSITY-END
title: End formula for codensity (Set-valued)
source:
  - type: slide
    where: "Codensity slides, 'The definition, via ends'"
    pages: [4]
  - type: paper
    where: "Mac Lane (1998), Categories for the Working Mathematician"
    pages: [218-220]
    note: "Ends and coends, Kan extensions"
---

**Statement (LaTeX).**
$$
T^G(A) \;=\; \int_{b\in \mathcal{B}} \big[\,\mathcal{A}(A, G b),\, G b\,\big].
$$

For Set-valued functor $G: \mathcal{B} \to \mathbf{Set}$, the codensity monad acts on object $A$ by taking the end over $b \in \mathcal{B}$ of the function space $[A \to G b, G b]$.

**Proof Sketch.**
This follows from the pointwise formula for right Kan extensions in Set. The end represents families of functions $\{\phi_b: (A \to G b) \to G b\}$ satisfying dinaturality constraints.

**Implications (TypeScript).**
- In `CodensitySet`, fiber at $b$: `[[A, G b], G b]` as function space
- Transport along $f:b\to b'$ via $Gf$ (post-compose both argument/result)
- End computation using existing `RightKan_Set` infrastructure
- Natural families represent codensity elements

**Witness Laws to Test.**
- $\eta_A(a)(k) = k(a)$ (unit evaluation)
- $\mu_A(\psi)_b(k)=\psi_b(t\mapsto t_b(k))$ (multiplication flattening)
- Dinaturality: For $f: b \to b'$, transport preserves natural transformation structure
- Cardinality: For discrete $\mathcal{B}$, $|T^G(A)| = \prod_{b} |G b|^{|G b|^{|A|}}$

**Future Unlocks.**
- Alternative computation via limits over the comma $(A \downarrow G)$
- Generalization to enriched categories beyond Set
- Connection to presheaf topoi and sheafification
- Operads and algebraic theories via codensity