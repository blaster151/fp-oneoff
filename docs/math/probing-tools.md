# Probing and Analysis Tools (collection)

## [THM-CODENSE-PROBE]
id: THM-CODENSE-PROBE
tags: [codense, heuristic, probe]
source: knowledge:"Heuristic detection of codense cases"
---
**Purpose**  
Heuristic detection of when \(T^G(A) \cong A\) (codense/trivial cases).

**Method**  
Compare cardinalities \(|T^G(A)|\) vs \(|A|\) and look for patterns.

**Implications (TS)**  
- `probeCodense(B, G, testSets)` for batch analysis
- Cardinality ratio computation for pattern detection
- Not a mathematical proof, but useful for exploration

**Use Cases**  
- Identifying potential adjoint cases where \(T^G \cong G \circ F\)
- Understanding codensity behavior patterns
- Educational exploration of small examples

**Limitations**  
- Heuristic only (not rigorous mathematical proof)
- Cardinality-based (may miss structural isomorphisms)
- Best for small finite examples

**Future unlocks**  
- Structural isomorphism detection beyond cardinality
- Pattern recognition for adjoint case prediction
- Machine learning approaches to codensity analysis

## [TOOL-COMMA-CROSS-CHECK]
id: TOOL-COMMA-CROSS-CHECK
tags: [comma, limit, educational]
source: knowledge:"Alternative codensity computation via comma category"
---
**Purpose**  
Educational cross-checking between end formula and comma category limit.

**Implementation**  
\(T^G(A) = \lim_{(f: A \to G d)} G d\) over comma category \((A \downarrow G)\).

**Verification**  
Comma method gives 314,928 elements matching theoretical formula exactly.

**Educational Value**  
- Demonstrates equivalence of end and limit formulations
- Provides concrete visualization of comma category structure
- Cross-validates implementation correctness

**Future unlocks**  
- General comma category constructions
- Teaching aid for categorical limits vs ends
- Alternative algorithms for special cases

## [ANALYSIS-CARDINALITY-PATTERNS]
id: ANALYSIS-CARDINALITY-PATTERNS
tags: [cardinality, patterns, analysis]
source: knowledge:"Codensity cardinality behavior analysis"
---
**Observed Patterns**  
Different functors show characteristic cardinality expansion patterns:

**Identity Cases**  
- Identity functor: \(|T^{\text{Id}}(A)| = |A|\) (ratio = 1)
- Adjoint cases: \(T^G \cong G \circ F\) often gives small ratios

**Non-Adjoint Cases**  
- FinSet ↪ Set: Large expansion ratios (ultrafilter case)
- Complex functors: Various patterns depending on structure

**Exponential Cases**  
- Discrete categories: \(|T^G(A)| = \prod_b |G b|^{|G b|^{|A|}}\)
- Rapid growth with |A| (exponential explosion)

**Future unlocks**  
- Classification of functor types by expansion patterns
- Predictive models for codensity behavior
- Optimization strategies based on pattern recognition