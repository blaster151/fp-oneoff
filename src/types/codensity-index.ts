// codensity-index.ts
// Codensity monad exports and utilities

// Core codensity monad implementation
export * from './codensity-set.js';

// Natural transformations viewpoint: T^G(A) ≅ Nat(G^A, G)
export * from './codensity-nat-view.js';

// Ergonomic monadic convenience layer (of/map/chain/ap)
export * from './codensity-monad.js';

// Discoverable entry point for codensity construction
export * from './codensity-of.js';

// Alternative comma category computation (educational)
export * from './codensity-comma.js';

// Codensity probing and analysis tools
export * from './codensity-probe.js';

// Re-export main implementations
export { 
  CodensitySet as default,
  CodensitySet,
  computeDiscreteCardinality,
  isDiscrete,
  demonstrateCodensitySet
} from './codensity-set.js';

export {
  powerFunctor,
  endToNat,
  natToEnd,
  createNaturalTransformation,
  verifyNaturality,
  unitNaturalTransformation,
  evaluationNaturalTransformation,
  multiPointEvaluation,
  composeCodensityNats,
  demonstrateNatView
} from './codensity-nat-view.js';

export {
  mkCodensityMonad,
  terminalCodensity,
  discreteCodensity,
  codensityToHKTMonad,
  exampleTerminalCodensity,
  exampleDiscreteCodensity,
  exampleMonadicComposition,
  demonstrateCodensityMonad
} from './codensity-monad.js';