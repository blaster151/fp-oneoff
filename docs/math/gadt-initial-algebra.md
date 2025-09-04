# GADT Initial Algebra Mathematical Traceability

## [GADT-INIT-ALGEBRA]
Every covariant GADT admits initial algebra semantics via higher-order functors.

## [GADT-PACKAGE]
From initial algebra semantics we derive an initial-algebra package:
fold (gfold), build (gbuildFrom), and fold/build fusion.

## [GADT-CHURCH-ISO]
Fix<F> ≅ Church<F> with toChurch / fromChurch isomorphism (up to βη).

## [GADT-FUSION]
Fusion law: gfold(alg)(gbuildFrom(coalg)(a)) = gbuildFrom(coalg)(a)(alg).

## [GADT-COVARIANCE]
Automation is provided for covariant cases; contravariant indices are out-of-scope here.