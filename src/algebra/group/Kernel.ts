import { FiniteGroup } from "../../structures/group/Group";
import { GroupHom } from "./structures";

/** The kernel ker(f) = { g ∈ G | f(g) = e_H }. */
export function kernelNormalSubgroup<G,H>(
  hom: GroupHom<G,H>,
  eqH: (a:H,b:H)=>boolean
): FiniteGroup<G> {
  const { source: G, target: HH, map } = hom;
  const elems = G.elems.filter(g => eqH(map(g), HH.id));
  return {
    elems,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq
  };
}