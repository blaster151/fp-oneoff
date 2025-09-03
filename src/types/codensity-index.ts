// codensity-index.ts
// Codensity monad exports and utilities

export * from './codensity-set.js';

// Re-export the main codensity implementation
export { 
  CodensitySet as default,
  CodensitySet,
  computeDiscreteCardinality,
  isDiscrete,
  demonstrateCodensitySet
} from './codensity-set.js';