---
id: THM-STONE-DUALITY
title: Stone duality between Boolean algebras and Stone spaces
source:
  - type: paper
    where: "Stone (1936), 'The theory of representations for Boolean algebras'"
    pages: [37-111]
  - type: book
    where: "Johnstone (1982), Stone Spaces"
    pages: [1-50]
---

**Statement (LaTeX).**
The categories of Boolean algebras and Stone spaces are dually equivalent:
$$
\mathbf{Bool}^{\text{op}} \simeq \mathbf{Stone}
$$

**Stone Representation.**
Every Boolean algebra $B$ is isomorphic to the Boolean algebra of clopen sets of its Stone space $\text{Spec}(B)$ (space of ultrafilters).

**Implications (TypeScript).**
- Ultrafilters form Stone space topology
- Boolean operations correspond to topological operations
- Finite case: discrete topology on finite Boolean algebras
- Stone space construction from ultrafilter monad

**Current Implementation.**
- Finite Boolean algebras via `MiniFinSet` morphisms
- Ultrafilter construction via codensity monad
- Discrete topology on finite sets
- Boolean algebra laws via naturality

**Future Unlocks.**
- Infinite Stone spaces and Boolean algebras
- Spectral topology and prime ideal spaces
- Applications to logic and model theory
- Locale theory and pointless topology
- Stone–Čech compactification
- Boolean-valued models in set theory