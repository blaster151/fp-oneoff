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
  
  // TODO: Add validation that N is actually a subgroup
  // - Should verify that N.carrier(G.e) is true (identity in N)
  // - Should verify closure: if N.carrier(a) and N.carrier(b), then N.carrier(G.op(a,b))
  // - Should verify inverses: if N.carrier(a), then N.carrier(G.inv(a))
  // - Currently we trust the caller, but this could lead to incorrect results
  
  return { ...N, conjClosed };
}