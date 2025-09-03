# Codensity Monads Slide Deck (collection)

## [THM-CODENSITY-DEFINITION]
id: THM-CODENSITY-DEFINITION
tags: [codensity, definition, monad]
source: slide:"Codensity monads slide deck - Definition slide"
---
**Statement (LaTeX)**  
The codensity monad of a functor \(G: \mathcal{B} \to \mathcal{C}\) is \(T^G = \mathrm{Ran}_G G\), when this right Kan extension exists.

**Implications (TS)**  
- Every functor potentially has a codensity monad
- Construction via right Kan extension along itself
- Provides "continuation-style" monadic structure

**Future unlocks**  
- Performance optimization of free monads via codensity
- Density comonad as dual construction
- Applications to operational semantics

## [THM-CODENSITY-KAN-FORMULA]
id: THM-CODENSITY-KAN-FORMULA  
tags: [codensity, kan, formula]
source: slide:"The definition, via Kan extensions"
---
**Statement (LaTeX)**  
\(T^G = \mathrm{Ran}_G\,G\).

**Implications (TS)**  
- `Codensity.codensityOf(B,G)` implements this construction
- Universal property gives natural transformations
- Continuation monad as special case

**Future unlocks**  
- Enriched/large category variants
- Kan extension calculus for complex constructions

## [THM-CODENSITY-END-FORMULA]
id: THM-CODENSITY-END-FORMULA
tags: [codensity, ends, pointwise]
source: slide:"The definition, via ends"
---
**Statement (LaTeX)**  
\(T^G(A) = \int_{b \in \mathcal{B}} [\mathcal{C}(A, G b), G b]\).

For Set-valued functors, this becomes the end over function spaces.

**Implications (TS)**  
- `CodensitySet` implements this end computation
- Fiber at \(b\): \((G b)^{(G b)^A}\) 
- Dinaturality via \(G\) on morphisms

**Future unlocks**  
- Alternative limit/comma category formulation
- Enriched end computations beyond Set

## [THM-ULTRAFILTER-FROM-CODENSITY]
id: THM-ULTRAFILTER-FROM-CODENSITY
tags: [ultrafilter, codensity, finset]
source: slide:"Ultrafilters from codensity monads"
---
**Statement (LaTeX)**  
For the inclusion \(G: \mathrm{FinSet} \hookrightarrow \mathrm{Set}\), we have
\(T^G(A) \cong \{\text{ultrafilters on } A\}\).

**Proof Sketch**  
The Boolean component of the codensity construction at object \(2 = \{0,1\}\) gives characteristic function evaluation, which characterizes ultrafilters.

**Implications (TS)**  
- `mkUltrafilterMonad()` specializes codensity construction
- Boolean component extraction via `ultrafilterFromCodensity`
- Naturality gives Boolean algebra laws automatically

**Future unlocks**  
- Eilenberg-Moore algebras = compact Hausdorff spaces (Manes)
- Stone duality connections
- Non-principal ultrafilters in infinite case

## [LAW-ULTRAFILTER-BOOLEAN-OPS]
id: LAW-ULTRAFILTER-BOOLEAN-OPS
tags: [ultrafilter, boolean, naturality]
source: slide:"Boolean algebra from naturality"; canonical:"Standard ultrafilter properties"
---
**Laws (LaTeX)**  
\(U(S \cap T) = U(S) \wedge U(T)\)  
\(U(S \cup T) = U(S) \vee U(T)\)  
\(U(A \setminus S) = \neg U(S)\)

**Proof Method**  
Pure naturality at Boolean objects with morphisms \(\land, \lor, \neg : 2 \times 2 \to 2\) and \(2 \to 2\).

**Implications (TS)**  
- No principal-witness reasoning required
- Categorical Boolean algebra via `MiniFinSet` morphisms
- Automatic law derivation from naturality

**Test hooks**  
- `src/types/__tests__/ultrafilter-naturality.test.ts`
- `src/types/__tests__/ultrafilter-demorgan.test.ts`

**Future unlocks**  
- Stone representation theorem
- Boolean-valued models
- Applications to logic and model theory

## [THM-DISCRETE-CARDINALITY]
id: THM-DISCRETE-CARDINALITY
tags: [codensity, discrete, cardinality]
source: slide:"Cardinality for discrete categories"; canonical:"Product formula for ends"
---
**Statement (LaTeX)**  
For discrete category \(\mathcal{B}\) and Set-valued \(G\):
\(|T^G(A)| = \prod_{b \in \mathcal{B}} |G b|^{|G b|^{|A|}}\).

**Proof Sketch**  
Discrete categories have no non-identity morphisms, so the end reduces to a product of function spaces.

**Implications (TS)**  
- Cardinality verification in `src/examples/codensity-set.ts`
- Concrete calculation: \(2^{2^2} \times 3^{3^2} = 314,928\)
- Validates implementation correctness

**Future unlocks**  
- Cardinality bounds for non-discrete categories
- Asymptotic analysis of codensity constructions

## [THM-CONTINUATION-CONNECTION]
id: THM-CONTINUATION-CONNECTION
tags: [codensity, continuation, cps]
source: slide:"Connection to continuation monad"; canonical:"CPS transformation"
---
**Statement (LaTeX)**  
The continuation monad \(\text{Cont}_R(A) = (A \to R) \to R\) is the codensity monad of the functor \((-) \times R : \mathbf{Set} \to \mathbf{Set}\).

**Implications (TS)**  
- `Cont` monad as special case of codensity
- CPS transformation via codensity construction
- `callCC`, `shift`/`reset` as codensity operations

**Future unlocks**  
- Delimited continuations via multiple codensity levels
- Algebraic effects and handlers
- Applications to operational semantics

## [THM-FREE-MONAD-OPTIMIZATION]
id: THM-FREE-MONAD-OPTIMIZATION
tags: [codensity, free, performance]
source: slide:"Performance optimization"; canonical:"Codensity optimization technique"
---
**Statement**  
Free monads can be optimized using codensity: \(\text{Free}(F) \cong T^{\text{Yoneda}(F)}\) with better associativity performance.

**Proof Sketch**  
Codensity transformation eliminates left-nested bind operations by CPS-transforming the computation.

**Implications (TS)**  
- Performance improvement for free monad chains
- CPS-style computation via codensity
- Operational vs denotational semantics connection

**Future unlocks**  
- Automatic optimization of monadic code
- Compiler transformations via codensity
- Applications to DSL implementation

## [THM-MANES-ULTRAFILTER-COMPACT]
id: THM-MANES-ULTRAFILTER-COMPACT
tags: [ultrafilter, compact, hausdorff, manes]
source: slide:"Manes theorem"; canonical:"Eilenberg-Moore algebras theorem"
---
**Statement (LaTeX)**  
Eilenberg-Moore algebras for the ultrafilter monad correspond bijectively to compact Hausdorff spaces.

**Implications (TS)**  
- `EMAlgebra` interface for ultrafilter monad
- Discrete finite spaces are compact Hausdorff
- Structure map picks principal witness

**Future unlocks**  
- Stone duality for Boolean algebras and Stone spaces
- Topological algebra applications
- Functional analysis connections

## [LAW-NATURALITY-SQUARES]
id: LAW-NATURALITY-SQUARES
tags: [naturality, commutative, diagrams]
source: canonical:"Standard category theory"
---
**Law (LaTeX)**  
For natural transformation \(\alpha: F \Rightarrow G\):
\(\alpha_B \circ F(f) = G(f) \circ \alpha_A\).

**Implications (TS)**  
- Naturality verification in all constructions
- Commutative diagrams as code verification
- Automatic law derivation from naturality

**Future unlocks**  
- Higher naturality and coherence
- 2-categorical structures
- Homotopy type theory connections