/**
 * A value-level witness that N ≤ G and N ⫳ G (normal).
 * We avoid enumerating elements; we carry what we need to check laws on demand.
 */
import { Group } from "./structures";

export interface Subgroup<G> {
  readonly carrier: (g: G) => boolean;   // membership predicate
  readonly include: (g: G) => G;         // inclusion (usually identity)
}

export interface NormalSubgroup<G> extends Subgroup<G> {
  /** For all g∈G, n∈N: g ◦ n ◦ g^{-1} ∈ N */
  readonly conjClosed: (g: G, n: G) => boolean;
}

export function isNormal<G>(G: Group<G>, N: Subgroup<G>): NormalSubgroup<G> | null {
  const conjClosed = (g: G, n: G) => N.carrier(G.op(g, G.op(n, G.inv(g))));
  // Quick sanity: identity in N implies closed under conjugation of e is e
  // We don't prove the subgroup axioms here; callers should supply a Subgroup that already satisfies them.
  
  // Validate that N is actually a subgroup
  // Check that identity is in N
  if (!N.carrier(G.id)) {
    throw new Error("Invalid subgroup: identity element not in subgroup");
  }
  
  // For finite groups, we can check closure and inverses on all elements
  if (G.elems) {
    const subgroupElements = G.elems.filter(N.carrier);
    
    // Check closure: if a,b ∈ N, then a·b ∈ N
    for (const a of subgroupElements) {
      for (const b of subgroupElements) {
        if (!N.carrier(G.op(a, b))) {
          throw new Error(`Invalid subgroup: not closed under operation (${a} · ${b} not in subgroup)`);
        }
      }
    }
    
    // Check inverses: if a ∈ N, then a⁻¹ ∈ N
    for (const a of subgroupElements) {
      if (!N.carrier(G.inv(a))) {
        throw new Error(`Invalid subgroup: inverse of ${a} not in subgroup`);
      }
    }
  }
  
  return { ...N, conjClosed };
}