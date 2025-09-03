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