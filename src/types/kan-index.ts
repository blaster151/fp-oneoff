// kan-index.ts
// Kan extensions and related categorical constructions
// Combines existing catkit-kan infrastructure with new pointwise implementations

// Re-export existing comprehensive Kan extension infrastructure
export * from './catkit-kan.js';

// New pointwise Right Kan extension implementation
export * from './ran-set.js';

// Aliases for convenience and API consistency
export { 
  RightKan_Set as RanSetExisting,
  LeftKan_Set as LanSetExisting 
} from './catkit-kan.js';

export {
  RanSet as RanSetPointwise,
  RanSetDirect as RanSetDirectEnd
} from './ran-set.js';