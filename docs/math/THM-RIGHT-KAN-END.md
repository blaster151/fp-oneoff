---
id: THM-RIGHT-KAN-END
title: Right Kan extension via ends (pointwise formula)
source:
  - type: book
    where: "Mac Lane (1998), Categories for the Working Mathematician"
    pages: [233-235]
  - type: paper
    where: "Kelly (1982), Basic concepts of enriched category theory"
    pages: [45-50]
---

**Statement (LaTeX).**
$$
(\mathrm{Ran}_F H)(d) \cong \int_{c \in \mathcal{C}} H(c)^{\mathcal{D}(d, F c)}.
$$

For functors $F: \mathcal{C} \to \mathcal{D}$ and $H: \mathcal{C} \to \mathbf{Set}$, the right Kan extension is given by the end formula with function spaces.

**Implications (TypeScript).**
- `RightKan_Set` computes this formula using end computation
- Function spaces via `allFunctions` enumeration
- Dinaturality constraints filter natural families
- Universal property provides natural transformations

**Witness Laws.**
- Universal property: Natural bijection between $\text{Nat}(K, \mathrm{Ran}_F H)$ and $\text{Nat}(K \circ F, H)$
- Functoriality: $(\mathrm{Ran}_F H)(f)$ acts by precomposition
- Composition: $\mathrm{Ran}_G (\mathrm{Ran}_F H) \cong \mathrm{Ran}_{G \circ F} H$

**Future Unlocks.**
- Left Kan extensions and adjoint relationships
- Kan extension calculus for complex functorial constructions
- Enriched Kan extensions beyond Set
- Applications to sheaf theory and topos theory