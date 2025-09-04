// Pure library entrypoint. No side-effects, no example runners.
// Re-export only the public type and value-level APIs.
export * from './types/index.js';

// GADT modules with higher-order functors and initial-algebra semantics
export * as GADT_HFun from "./gadt/HFun.js";
export * as GADT_Initial from "./gadt/Initial.js";
export * as GADT_Church from "./gadt/Church.js";
export * as GADT_Adapters from "./gadt/adapters.js";
export * as GADT_Reduction from "./gadt/Reduction.js";
export * as GADT_Term from "./gadt/examples/Term.js";