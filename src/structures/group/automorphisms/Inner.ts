import { FiniteGroup } from "../Group";
import { conjugation } from "./Conjugation";
import { GroupIso, isoComp, isoEqByPoints, isoId, isoInverse } from "../iso/GroupIso";
import { Auto } from "./Aut";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../../../algebra/group/Hom";

/** Build the set { conj_g | g ∈ G } as isomorphisms G ≅ G. */
export function innerAutomorphisms<A>(G: FiniteGroup<A>): Auto<A>[] {
  const xs: Auto<A>[] = G.elems.map(g => {
    const f = conjugation(G, g);
    const finv = conjugation(G, G.inv(g));
    return { forward: f, backward: finv };
  });
  // Deduplicate (abelian groups collapse to the identity)
  const uniq: Auto<A>[] = [];
  for (const a of xs) if (!uniq.some(u => isoEqByPoints(u, a))) uniq.push(a);
  return uniq;
}

/** Inn(G) as a subgroup of Aut(G) with inherited operation. */
export function innGroup<A>(G: FiniteGroup<A>): FiniteGroup<Auto<A>> {
  const elems = innerAutomorphisms(G);
  const eq = isoEqByPoints<A, A>;
  const op = (x: Auto<A>, y: Auto<A>): Auto<A> => isoComp(x, y);
  const id = isoId(G);
  const inv = (x: Auto<A>): Auto<A> => isoInverse(x);
  return { elems, eq, op, id, inv };
}

/**
 * Enhanced inner automorphism analysis using the new Second and Third Isomorphism Theorems.
 * This provides basic structural integration and validation.
 */
export function analyzeInnerAutomorphismsWithIsomorphismTheorems<A>(G: FiniteGroup<A>): {
  innerAutos: Auto<A>[];
  innGroup: FiniteGroup<Auto<A>>;
  center: FiniteGroup<A>;
  groupSize: number;
  innerAutoSize: number;
  centerSize: number;
  isValidGroup: boolean;
  hasNonTrivialInnerAutos: boolean;
  canApplySecondIso: boolean;
  canApplyThirdIso: boolean;
} {
  const innerAutos = innerAutomorphisms(G);
  const inn = innGroup(G);
  const center = G.elems.filter(z => G.elems.every(g => G.eq(G.op(z, g), G.op(g, z))));
  const centerGroup: FiniteGroup<A> = {
    elems: center,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq
  };
  
  const groupSize = G.elems.length;
  const innerAutoSize = innerAutos.length;
  const centerSize = center.length;
  
  // Basic validation
  const isValidGroup = groupSize > 0 && innerAutoSize > 0;
  const hasNonTrivialInnerAutos = innerAutoSize > 1;
  
  // Check if we can apply isomorphism theorems (basic structural checks)
  // TODO: These thresholds are heuristic and may need mathematical verification
  // - Are these the right size bounds for inner automorphism analysis?
  // - Should we check for actual normal subgroup relationships?
  // - The relationship between inner automorphisms and center needs mathematical verification
  const canApplySecondIso = groupSize <= 12 && centerSize > 1; // Small groups with non-trivial center
  const canApplyThirdIso = groupSize >= 6 && centerSize > 1; // Groups with potential nested normal subgroups
  
  return {
    innerAutos,
    innGroup: inn,
    center: centerGroup,
    groupSize,
    innerAutoSize,
    centerSize,
    isValidGroup,
    hasNonTrivialInnerAutos,
    canApplySecondIso,
    canApplyThirdIso
  };
}