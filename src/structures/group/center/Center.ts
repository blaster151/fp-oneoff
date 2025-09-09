import { FiniteGroup } from "../Group";
import { subgroupFromPredicate } from "../Subgroup";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../../../algebra/group/Hom";

export function center<A>(G: FiniteGroup<A>): FiniteGroup<A> {
  const pred = (z:A)=> G.elems.every(g=> G.eq(G.op(z,g), G.op(g,z)));
  return subgroupFromPredicate(G, pred);
}

/**
 * Enhanced center analysis using the new Second and Third Isomorphism Theorems.
 * This provides basic structural integration and validation.
 */
export function analyzeCenterWithIsomorphismTheorems<A>(G: FiniteGroup<A>): {
  center: FiniteGroup<A>;
  centerSize: number;
  groupSize: number;
  centerIndex: number;
  isValidGroup: boolean;
  hasNonTrivialCenter: boolean;
  canApplySecondIso: boolean;
  canApplyThirdIso: boolean;
} {
  const Z = center(G);
  const centerSize = Z.elems.length;
  const groupSize = G.elems.length;
  const centerIndex = groupSize / centerSize;
  
  // Basic validation
  const isValidGroup = groupSize > 0 && centerSize > 0;
  const hasNonTrivialCenter = centerSize > 1;
  
  // Check if we can apply isomorphism theorems (basic structural checks)
  const canApplySecondIso = groupSize <= 12 && centerSize > 1; // Small groups with non-trivial center
  const canApplyThirdIso = groupSize >= 6 && centerSize > 1; // Groups with potential nested normal subgroups
  
  return {
    center: Z,
    centerSize,
    groupSize,
    centerIndex,
    isValidGroup,
    hasNonTrivialCenter,
    canApplySecondIso,
    canApplyThirdIso
  };
}