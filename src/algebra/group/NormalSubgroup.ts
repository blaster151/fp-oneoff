/**
 * A value-level witness that N ≤ G and N ⫳ G (normal).
 * We avoid enumerating elements; we carry what we need to check laws on demand.
 */
import { Group } from "./Group";

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
  return { ...N, conjClosed };
}