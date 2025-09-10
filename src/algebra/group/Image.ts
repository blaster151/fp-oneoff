import { FiniteGroup } from "../../structures/group/Group";
import { GroupHom } from "./structures";

/** The subgroup im(f) ⊆ H as an induced finite group. */
export function imageSubgroup<G,H>(
  hom: GroupHom<G,H>,
  eqH: (a:H,b:H)=>boolean
): FiniteGroup<H> {
  const { source: G, target: HH, map } = hom;
  const elems: H[] = [];
  for (const g of G.elems) {
    const h = map(g);
    if (!elems.some(x => eqH(x,h))) elems.push(h);
  }
  return {
    elems,
    op: HH.op,
    id: HH.id,
    inv: HH.inv,
    eq: HH.eq
  };
}