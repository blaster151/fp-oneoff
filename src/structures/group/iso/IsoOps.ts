import { GroupIso, isoComp, isoInverse, isoEqByPoints } from "./GroupIso";

// Re-export helpers for ergonomic imports where types are needed at call sites.
export const IsoOps = {
  comp: isoComp,
  inv: isoInverse,
  eq: isoEqByPoints
};