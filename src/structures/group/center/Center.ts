import { FiniteGroup } from "../Group";
import { subgroupFromPredicate } from "../Subgroup";

export function center<A>(G: FiniteGroup<A>): FiniteGroup<A> {
  const pred = (z:A)=> G.elems.every(g=> G.eq(G.op(z,g), G.op(g,z)));
  return subgroupFromPredicate(G, pred);
}