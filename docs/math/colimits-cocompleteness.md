# Colimits and Cocompleteness (collection)

## [COLIM-FINSET]
id: COLIM-FINSET
tags: [colimit, coproduct, coequalizer, pushout, FinSet]
source: canonical:"Finite colimits in Set"
---
**Statement (LaTeX)**  
FinSet has all finite colimits: initial object, coproducts, and coequalizers.

**Constructions**  
- Coproduct: \(A \oplus B\) as tagged disjoint union
- Coequalizer: \(Y/{\sim}\) where \(r(x) \sim s(x)\) for \(r,s: X \rightrightarrows Y\)
- Pushout: \(B \sqcup_A C = \text{coeq}(B \oplus C \rightrightarrows B \oplus C)\)

**Implications (TS)**  
- `coproduct(A, B)` with injections `inl`, `inr`
- `coequalizer(X, Y, r, s)` with quotient map `q`
- `pushout(A, B, C, f, g)` with induced maps `iB`, `iC`

**Universal Properties**  
- Coproduct: Unique mediating morphism \([f,g]: A \oplus B \to Z\)
- Coequalizer: \(q \circ r = q \circ s\) with universal factorization
- Pushout: Universal property for commutative squares

**Test Hook**  
`src/types/__tests__/finset-colimits.test.ts`

**Future unlocks**  
- Infinite colimits and filtered colimits
- Locally presentable categories
- Accessible categories and sketches

## [COLIM-PRESHEAF]
id: COLIM-PRESHEAF
tags: [colimit, presheaf, pointwise]
source: canonical:"[C^op, Set] is cocomplete; colimits computed pointwise"
---
**Statement (LaTeX)**  
Presheaf categories \([\mathcal{C}^{\text{op}}, \mathbf{Set}]\) are cocomplete with pointwise colimits.

**Pointwise Construction**  
For presheaves \(P, Q: \mathcal{C}^{\text{op}} \to \mathbf{Set}\):
- \((P \oplus Q)(c) = P(c) \oplus Q(c)\)
- \((\text{coeq}(r,s))(c) = \text{coeq}(r_c, s_c)\)

**Contravariant Action**  
Morphism action preserves colimit structure contravariantly.

**Implications (TS)**  
- `pshCoproduct(C, P, Q)` pointwise coproduct construction
- `pshCoequalizer(C, R, S, r, s)` pointwise coequalizer
- `pshPushout(C, R, P, Q, f, g)` pointwise pushout
- `verifyPresheafColimits` for cocompleteness verification

**Universal Properties**  
- Pointwise universal properties at each object
- Natural transformation factorization
- Topos structure (complete and cocomplete)

**Test Hook**  
`src/types/__tests__/presheaf-colimits.test.ts`

**Future unlocks**  
- Sheafification and Grothendieck topologies
- Topos theory and internal logic
- Geometric morphisms and sites

## [THM-PRESHEAF-COCOMPLETE]
id: THM-PRESHEAF-COCOMPLETE
tags: [presheaf, cocomplete, topos]
source: canonical:"Presheaf categories are topoi"
---
**Statement (LaTeX)**  
For any small category \(\mathcal{C}\), the presheaf category \([\mathcal{C}^{\text{op}}, \mathbf{Set}]\) is a topos: complete, cocomplete, and cartesian closed.

**Topos Structure**  
- Complete: All small limits exist
- Cocomplete: All small colimits exist (pointwise construction)
- Cartesian closed: Exponential objects \(Q^P\) exist

**Cocompleteness**  
Colimits computed pointwise using colimits in Set.

**Implications (TS)**  
- Foundation for topos theory implementation
- Internal logic and higher-order reasoning
- Sheaf theory and geometric applications

**Current Implementation**  
- Finite colimits: Coproducts, coequalizers, pushouts
- Pointwise construction: Using FinSet colimits
- Universal properties: Verified for finite cases

**Future unlocks**  
- Complete topos structure implementation
- Internal logic and type theory
- Sheafification and geometric morphisms
- Applications to algebraic geometry and logic

## [UNIV-COLIMIT]
id: UNIV-COLIMIT
tags: [colimits, universal, property]
source: canonical:"Universal property of colimits"
---
**Statement (LaTeX)**  
A colimit of diagram \(D: \mathcal{J} \to \mathcal{C}\) is an object \(\text{colim } D\) with maps \(\iota_j: D(j) \to \text{colim } D\) such that for any object \(X\) and compatible family \(\{f_j: D(j) \to X\}\), there exists unique \(h: \text{colim } D \to X\) with \(h \circ \iota_j = f_j\).

**Universal Factorization**  
Every compatible cocone factors uniquely through the colimit.

**Examples**  
- Coproduct: Colimit of discrete diagram
- Coequalizer: Colimit of parallel pair
- Pushout: Colimit of span diagram

**Implications (TS)**  
- Universal property verification in tests
- Mediating morphism construction
- Cocone factorization checking

**Future unlocks**  
- General colimit computation algorithms
- Kan extensions as generalized colimits
- Adjoint functor theorem applications

## [DEF-DIAGRAM]
id: DEF-DIAGRAM
tags: [diagram, functor, shape]
source: canonical:"Diagram D: J → C from shape category J"
---
**Definition (LaTeX)**  
A diagram of shape \(J\) in category \(\mathcal{C}\) is a functor \(D: J \to \mathcal{C}\).

**Components**  
- Shape category \(J\) (finite for computational purposes)
- Target category \(\mathcal{C}\) (Set or FinSet)
- Functor \(D\) preserving composition and identities

**Common Shapes**  
- Discrete: Products and coproducts
- Parallel pair: Equalizers and coequalizers  
- Span: Pushouts and pullbacks
- General: Arbitrary finite shapes

**Implications (TS)**  
- `DiagramToFinSet<J>` interface with shape and functor
- `createDiagram(shape, functor)` constructor
- Foundation for general (co)limit computation

**Future unlocks**  
- Large diagrams and filtered (co)limits
- Sketches and accessible categories
- Model theory and categorical logic

## [LIMIT-GENERAL]
id: LIMIT-GENERAL
tags: [limit, diagram, cone, universal]
source: canonical:"General limits via cone universal property"
---
**Statement (LaTeX)**  
Limit of diagram \(D: J \to \mathcal{C}\) is object \(\lim D\) with cone \(\{\pi_j: \lim D \to D(j)\}\) universal among cones.

**Construction (FinSet)**  
Subset of product \(\prod_j D(j)\) satisfying cone equations \(D(f)(\pi_a(x)) = \pi_b(x)\).

**Universal Property**  
Every cone \(\{f_j: X \to D(j)\}\) factors uniquely through limit cone.

**Implications (TS)**  
- `limitFinSet(D)` general limit computation
- Cone equation verification
- Universal property checking

**Test Hook**  
`src/types/__tests__/finset-diagram.test.ts`

**Future unlocks**  
- Limit preservation by functors
- Adjoint functor theorem
- Completeness characterizations

## [COLIM-GENERAL]
id: COLIM-GENERAL
tags: [colimit, diagram, cocone, universal]
source: canonical:"General colimits via cocone universal property"
---
**Statement (LaTeX)**  
Colimit of diagram \(D: J \to \mathcal{C}\) is object \(\text{colim } D\) with cocone \(\{\iota_j: D(j) \to \text{colim } D\}\) universal among cocones.

**Construction (FinSet)**  
Quotient of coproduct \(\coprod_j D(j)\) by relations \(D(f)(x) \sim x\) for morphisms \(f: a \to b\).

**Universal Property**  
Every cocone \(\{f_j: D(j) \to X\}\) factors uniquely through colimit cocone.

**Implications (TS)**  
- `colimitFinSet(D)` general colimit computation
- Cocone relation generation
- Universal property verification

**Test Hook**  
`src/types/__tests__/finset-diagram.test.ts`

**Future unlocks**  
- Colimit preservation by functors
- Kan extensions as generalized colimits
- Locally presentable categories