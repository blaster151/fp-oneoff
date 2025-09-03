---
id: THM-CODENSITY-RAN
title: Codensity monad as a right Kan extension
source:
  - type: slide
    where: "Codensity slides, 'The definition, via Kan extensions'"
    pages: [3]
    note: "T^G = Ran_G G; monad from Kan universality"
  - type: paper
    where: "Leinster (2013), 'Codensity and the ultrafilter monad'"
    pages: [2-3]
---

**Statement (LaTeX).**
$$
T^G \;=\; \mathrm{Ran}_G\,G \, .
$$

For any functor $G: \mathcal{B} \to \mathcal{C}$, the codensity monad $T^G$ (when it exists) is the right Kan extension of $G$ along itself.

**Proof Sketch.**
The right Kan extension $\mathrm{Ran}_G G$ has the universal property that natural transformations $\alpha: K \Rightarrow G$ correspond bijectively to natural transformations $\beta: K \Rightarrow \mathrm{Ran}_G G$. This universal property exactly characterizes the codensity monad.

**Implications (TypeScript).**
- Provide `codensityOf(B,G)` that returns `mkCodensityMonad(B,G)`
- Ensure `CodensitySet` computes pointwise via existing `RightKan_Set`
- Functor $T^G: \mathcal{C} \to \mathcal{C}$ with monad structure
- Unit $\eta: \text{Id} \Rightarrow T^G$ and multiplication $\mu: T^G T^G \Rightarrow T^G$

**Witness Laws to Test.**
- If $G \dashv F$ exists, then $T^G \cong G \circ F$
- Functoriality on morphisms: $T^G(f) = \lambda \phi.\,\phi \circ (\_\!\!f)$
- Unit law: $\mu \circ \eta_{T^G} = \text{id}_{T^G}$
- Associativity: $\mu \circ T^G(\mu) = \mu \circ \mu_{T^G}$

**Future Unlocks.**
- Enriched/large variants once `Ends` generalized beyond `Set`
- Density comonad as left Kan extension $\mathrm{Lan}_G G$
- Kan extension calculus for composite functors
- Connection to adjoint functor theorem