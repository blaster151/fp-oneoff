// rel-factory-default.ts
// Default RelFactory wired to config.REL_IMPL

import { makeRelFactory, RelStrategy } from "./rel-common.js";
import { REL_IMPL } from "./config.js";

// Create default factory based on configuration
export const DefaultRelFactory = makeRelFactory(REL_IMPL as RelStrategy);

// Convenience exports that use the default factory
export const DefaultRel = {
  empty: DefaultRelFactory.empty.bind(DefaultRelFactory),
  fromPairs: DefaultRelFactory.fromPairs.bind(DefaultRelFactory),
  id: DefaultRelFactory.id.bind(DefaultRelFactory),
  strategy: DefaultRelFactory.strategy
};

// Tiny self-check
if (typeof require !== 'undefined' && require.main === module) {
  const { Finite } = await import("./rel-equipment.js");
  const A = new Finite([0, 1]);
  const B = new Finite(["x", "y"]);
  const R = DefaultRel.fromPairs(A, B, [[0, "x"], [1, "y"]]);
  console.log("DefaultRel strategy:", DefaultRel.strategy);
  console.log("Default relation created:", R.toPairs().length, "pairs");
}