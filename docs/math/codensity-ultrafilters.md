# Codensity, Kan extensions, and Ultrafilters (collection)

## [THM-CODENSITY-RAN]
id: THM-CODENSITY-RAN
tags: [codensity, kan, ran]
source: slide:"The definition, via Kan extensions"
---
**Statement (LaTeX)**  
\(T^G = \mathrm{Ran}_G\,G\).

**Implications (TS)**  
- `Codensity.codensityOf(B,G)` returns its monad ops.

**Future unlocks**  
- Enriched/large variants once Ends generalized beyond Set.
- Density comonad as left Kan extension Lan_G G.
- Kan extension calculus for composite functors.
- Connection to adjoint functor theorem.

## [THM-CODENSITY-END]
id: THM-CODENSITY-END
tags: [codensity, ends]
source: slide:"The definition, via ends"
---
**Statement**  
\(T^G(A)=\int_{b}[\mathcal A(A,Gb),Gb]\).

**Implications (TS)**  
- In `CodensitySet`: fiber \((Gb)^{(Gb)^A}\), transporter via `G.onMor`.
- End computation using existing `RightKan_Set` infrastructure.
- Natural families represent codensity elements.

**Future unlocks**  
- Alternative computation via limits over the comma \((A \downarrow G)\).
- Generalization to enriched categories beyond Set.
- Connection to presheaf topoi and sheafification.
- Operads and algebraic theories via codensity.

## [THM-ULTRAFILTER-MONAD]
id: THM-ULTRAFILTER-MONAD
tags: [ultrafilter, codensity, finset]
source: slide:"Ultrafilters from codensity monads"
---
**Statement**  
For \(G:\mathrm{FinSet}\hookrightarrow\mathrm{Set}\), \(T^G(A)\cong\{\text{ultrafilters on }A\}\).

**Implications (TS)**  
- Interpret element via Bool component; naturality gives ∧,∨,¬ laws.
- `mkUltrafilterMonad()` provides familiar monadic interface.
- Principal ultrafilters via unit: η_A(a) gives principal ultrafilter at a.

**Future unlocks**  
- EM-algebras = compact Hausdorff (Manes theorem).
- Stone duality between Boolean algebras and Stone spaces.
- Non-principal ultrafilters require axiom of choice (infinite case).
- Stone–Čech compactification via ultrafilter construction.
- Applications to functional analysis and topology.

## [LAW-ULTRA-AND]
id: LAW-ULTRA-AND
tags: [ultrafilter, boolean]
source: slide:"Ultrafilters …"; canonical:"Naturality at 2×2 with and"
---
**Law**  
\(U(S\cap T)=U(S)\wedge U(T)\).

**Test hook**  
`src/types/__tests__/ultrafilter-naturality.test.ts`

**Future unlocks**  
- Generalization to Boolean algebra homomorphisms.
- Stone representation theorem for Boolean algebras.

## [LAW-ULTRA-DEMORGAN]
id: LAW-ULTRA-DEMORGAN
tags: [ultrafilter, boolean]
source: canonical:"De Morgan via not, and"
---
**Law**  
\(U(S\cup T)=U(S)\vee U(T)\), \(U(A\setminus S)=\neg U(S)\).

**Test hook**  
`src/types/__tests__/ultrafilter-demorgan.test.ts`

**Future unlocks**  
- Boolean algebra homomorphisms and Stone spaces.
- Ultrafilter limits and convergence in topological spaces.

## [LAW-ULTRA-DISTRIBUTIVITY]
id: LAW-ULTRA-DISTRIBUTIVITY
tags: [ultrafilter, boolean, distributivity]
source: knowledge:"Boolean algebra distributivity via naturality"
---
**Law**  
\(U(S \land (T \lor W)) = U((S \land T) \lor (S \land W))\).

**Proof Method**  
Pure categorical naturality with Boolean morphisms \(\land, \lor\) in MiniFinSet.

**Test hook**  
`src/types/__tests__/ultrafilter-distributivity.test.ts`

**Implications (TS)**  
- Complete Boolean algebra structure via naturality
- Distributivity without principal witness reasoning
- Absorption laws: \(S \land (S \lor T) = S\)

**Future unlocks**  
- Complete lattice theory via categorical methods
- Stone representation for Boolean algebras
- Applications to logic and algebraic structures

## [THM-RIGHT-KAN-END]
id: THM-RIGHT-KAN-END
tags: [kan, ends, pointwise]
source: canonical:"Mac Lane pointwise formula"
---
**Statement**  
\((\mathrm{Ran}_F H)(d) \cong \int_{c} H(c)^{\mathcal{D}(d, F c)}\).

**Implications (TS)**  
- `RightKan_Set` computes this formula using end computation.
- Function spaces via `allFunctions` enumeration.

**Future unlocks**  
- Left Kan extensions and adjoint relationships.
- Enriched Kan extensions beyond Set.
- Applications to sheaf theory and topos theory.

## [LAW-MONAD-LAWS]
id: LAW-MONAD-LAWS
tags: [monad, laws]
source: knowledge:"Standard monad coherence conditions"
---
**Laws**  
Unit: \(\mu \circ \eta_T = \text{id}\), \(\mu \circ T(\eta) = \text{id}\).  
Associativity: \(\mu \circ \mu_T = \mu \circ T(\mu)\).

**Future unlocks**  
- Monad transformers and composition.
- Algebraic effects and handlers.
- Kleisli categories and enriched monads.

## [THM-SHIFT-RESET]
id: THM-SHIFT-RESET
tags: [continuations, control]
source: canonical:"Danvy-Filinski delimited control"
---
**Statement**  
\(\text{reset} : \text{Cont}(A,A) \to \text{Cont}(R,A)\), 
\(\text{shift} : ((A \to \text{Cont}(R,R)) \to \text{Cont}(R,R)) \to \text{Cont}(R,A)\).

**Future unlocks**  
- Multi-prompt delimited control (shift₀/reset₀, shift₁/reset₁).
- Algebraic effects and handlers via delimited continuations.
- Coroutines and generators from control operators.

## [THM-CODENSITY-EXISTENCE]
id: THM-CODENSITY-EXISTENCE
tags: [codensity, existence, limits]
source: canonical:"Exists if D is small and C has small limits; or if G has a left adjoint."
---
**Note** Guardrails for `codensityOf`.

**Implications (TS)**  
- `CodensityAssumptions` type documents existence conditions
- Soft warnings for potentially invalid constructions
- Our finite Set case satisfies existence conditions

**Future unlocks**  
- Existence checking for general categories
- Alternative constructions when Kan extension doesn't exist
- Enriched category existence conditions

## [THM-CODENSITY-ADJOINT]
id: THM-CODENSITY-ADJOINT
tags: [adjunction, monad]
source: canonical:"If G ⊣ F then T^G ≅ G∘F."
---
**Test hook** `src/types/__tests__/codensity-adjunction.test.ts`

**Implications (TS)**  
- Optimization opportunity when adjoint exists
- Explains why some codensity constructions are "trivial"
- Performance improvement via adjoint collapse

**Future unlocks**  
- Automatic detection of adjoint cases
- Performance optimization via adjoint collapse
- General adjoint functor applications

## [EX-DOUBLE-DUALIZATION]
id: EX-DOUBLE-DUALIZATION
tags: [finvect, dual, codensity]
source: canonical:"Inclusion FinVect_fd ↪ Vect yields V ↦ V**."
---
**Future unlocks** Add `FinVect(F2)` fixture; verify V ≅ V** (finite dimension).

**Implications (TS)**  
- Potential `FinVect` module over F₂
- Linear maps as bit-matrices
- Dual space construction V*
- Evaluation/coevaluation maps

**Current Target**  
- Finite vector spaces over F₂
- Matrix representation with bit operations
- Double dual isomorphism V ≅ V** verification

## [REL-ISBELL-CODENSITY]
id: REL-ISBELL-CODENSITY
tags: [isbell, yoneda, presheaf]
source: canonical:"Spec∘O is codensity of Yoneda; Isbell duality."
---
**Future unlocks**  
- Build tiny Presheaf(C) for small C; experiment with Yoneda's codensity.

**Implications (TS)**  
- Presheaf category constructions
- Yoneda embedding and its codensity
- Isbell duality between presheaves and copresheaves
- Spectral theory connections

**Research Direction**  
- Small category C with Presheaf(C) = [C^op, Set]
- Yoneda Y: C → Presheaf(C)
- Codensity of Yoneda: Spec∘O construction
- Connection to algebraic geometry and topos theory