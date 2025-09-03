# Yoneda Embedding and Presheaf Categories (collection)

## [DEF-PRESHEAF]
id: DEF-PRESHEAF
tags: [presheaf, contravariant, functor]
source: canonical:"P: C^op → Set"
---
**Definition (LaTeX)**  
A presheaf on category \(C\) is a contravariant functor \(P: C^{\text{op}} \to \mathbf{Set}\).

**Contravariance**  
For morphism \(f: a \to b\) in \(C\), we get \(P(f): P(b) \to P(a)\).

**Implications (TS)**  
- `Presheaf<C>` interface with `onObj` and contravariant `onMor`
- Natural transformations as morphisms in presheaf category
- `checkNaturality` for natural transformation verification

**Applications**  
- Representable functors via Yoneda embedding
- Topos theory and sheaves
- Categorical logic and semantics

**Future unlocks**  
- Sheafification and Grothendieck topologies
- Presheaf topos constructions
- Applications to algebraic geometry

## [DEF-YONEDA]
id: DEF-YONEDA
tags: [yoneda, presheaf]
source: canonical:"y: C → Set^{C^op}"
---
**Definition (LaTeX)**  
The Yoneda embedding is \(Y: C \to [C^{\text{op}}, \mathbf{Set}]\) given by \(Y(c) = \text{Hom}(-, c)\).

**Representable Functor**  
\(Y(c)(a) = \text{Hom}_C(a, c)\) with contravariant action on morphisms.

**Properties**  
- Fully faithful functor
- Preserves and reflects limits
- Dense when \(C\) is small

**Implications (TS)**  
- `Yoneda(C).y(c)` constructs representable presheaf
- `createYonedaEmbedding` for systematic construction
- Contravariant action via precomposition

**Future unlocks**  
- Yoneda's codensity and Isbell duality
- Representable presheaves and universal properties
- Dense subcategory theorems

## [LEM-YONEDA]
id: LEM-YONEDA
tags: [yoneda, lemma]
source: canonical:"Nat(y(c),F) ≅ F(c)"
---
**Statement (LaTeX)**  
For any presheaf \(F: C^{\text{op}} \to \mathbf{Set}\) and object \(c \in C\):
\[\text{Nat}(Y(c), F) \cong F(c)\]

**Isomorphism**  
- \(\phi: \text{Nat}(Y(c), F) \to F(c)\) by \(\phi(\alpha) = \alpha_c(\text{id}_c)\)
- \(\psi: F(c) \to \text{Nat}(Y(c), F)\) by \(\psi(x)_a(h: a \to c) = F(h)(x)\)

**Proof Sketch**  
Natural bijection established by evaluation at identity and universal property of representable functors.

**Implications (TS)**  
- `yonedaLemmaIso(c, F)` provides explicit isomorphism
- Round-trip verification: \(\phi \circ \psi = \text{id}\), \(\psi \circ \phi = \text{id}\)
- Foundation for representable functor theory

**Test Hook**  
`src/types/__tests__/yoneda.test.ts`

**Future unlocks**  
- Universal properties and representability
- Adjoint functor theorem applications
- Categorical semantics and logic

## [THM-YONEDA-FULLY-FAITHFUL]
id: THM-YONEDA-FULLY-FAITHFUL
tags: [yoneda, fully, faithful]
source: knowledge:"Yoneda embedding is fully faithful"
---
**Statement (LaTeX)**  
The Yoneda embedding \(Y: C \to [C^{\text{op}}, \mathbf{Set}]\) is fully faithful.

**Full**  
Every natural transformation between representables comes from a morphism in \(C\).

**Faithful**  
Different morphisms in \(C\) give different natural transformations.

**Proof Sketch**  
Follows from Yoneda lemma: \(\text{Hom}_{\text{Psh}}(Y(c), Y(d)) \cong \text{Hom}_C(d, c)\).

**Implications (TS)**  
- `isFullyFaithful: true` in Yoneda embedding construction
- Justifies viewing \(C\) as subcategory of \([C^{\text{op}}, \mathbf{Set}]\)
- Foundation for embedding theorems

**Future unlocks**  
- Dense subcategory results
- Completion and free cocompletion
- Categorical foundations

## [CAT-PRESHEAF]
id: CAT-PRESHEAF
tags: [presheaf, category, topos]
source: knowledge:"Presheaf category [C^op, Set] construction"
---
**Definition (LaTeX)**  
The presheaf category \([C^{\text{op}}, \mathbf{Set}]\) has:
- Objects: Presheaves \(P: C^{\text{op}} \to \mathbf{Set}\)
- Morphisms: Natural transformations between presheaves

**Properties**  
- Complete and cocomplete
- Cartesian closed (topos)
- Contains \(C\) via Yoneda embedding

**Implications (TS)**  
- Natural transformation composition
- Limits and colimits in presheaf categories
- Exponential objects and internal logic

**Current Status**  
- Basic presheaf interface implemented
- Natural transformation checking available
- Full category construction: future work

**Future unlocks**  
- Complete topos structure
- Sheafification and Grothendieck topologies
- Categorical logic and semantics
- Applications to algebraic geometry