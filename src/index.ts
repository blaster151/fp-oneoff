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

// Category theory foundations
export * as Category_Nat from "./category/Nat.js";
export * as Category_HFunctor from "./category/HFunctor.js";
export * as Category_Lan from "./category/Lan.js";
export * as Category_LanGadtBridge from "./category/examples/LanGadtBridge.js";

// Core category theory (equality, natural transformations, higher-order functors, Lan)
export * as Cat_Eq from "./category/Eq";
export * as Cat_Nat from "./category/Nat";
export * as Cat_HFunctor from "./category/HFunctor";
export * as Cat_Lan from "./category/Lan";