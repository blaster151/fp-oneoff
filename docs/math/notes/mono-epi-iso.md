# Mono / Epi / Iso for Group Homomorphisms (Smith §2.5–§2.6)

**Definitions.**
- *Isomorphism* \(f:G\to H\): a homomorphism with a two-sided inverse \(g:H\to G\),
  i.e. \(g\circ f = \mathrm{id}_G\) and \(f\circ g = \mathrm{id}_H\).
- *Monomorphism*: left-cancellable morphism. For all groups \(J\) and homs \(g,h:J\to G\),
  \(f\circ g = f\circ h \Rightarrow g = h\).
- *Epimorphism*: right-cancellable morphism. For all groups \(K\) and homs \(g,h:H\to K\),
  \(g\circ f = h\circ f \Rightarrow g = h\).

**Theorems recorded.**
- **Iso via inverse** (Smith §2.6, Thm 4).  
  Implemented by `analyzeHom`: we search homs \(H\to G\) to witness two-sided inverse.
- **Mono = injective (Grp)** (Smith §2.6, Thm 5; proof deferred in text).  
  Our code checks *categorical* mono (left-cancellability) directly; for finite carriers this
  agrees with injectivity, giving a computation-friendly route.

**Operationalization.**
- `src/algebra/group/Hom.ts`  
  - `isHomomorphism`: checks preservation of op.  
  - `allGroupHoms`: enumerates homs `J -> G` (finite).  
  - `analyzeHom`: computes witnesses `{ isHom, isMono, isEpi, isIso, leftInverse?, rightInverse? }`
    and stores optional counterexamples for cancellability.
- `src/algebra/group/__tests__/hom-witnesses.spec.ts`  
  - *Iso*: `C5` automorphisms \(x \mapsto kx\).  
  - *Mono not epi*: inclusion `C2 -> C4`.  
  - *Epi not mono*: quotient `C4 -> C2`.

*Source:* Smith, *Introduction to Category Theory*, §2.5–§2.6 (pages "Isomorphisms, automorphisms" and "Redefining isomorphisms").