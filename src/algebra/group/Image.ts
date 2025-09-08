import { FiniteGroup } from "./Group";
import { GroupHom } from "./Hom";

/** The subgroup im(f) ⊆ H as an induced finite group. */
export function imageSubgroup<G,H>(
  hom: GroupHom<unknown,unknown,G,H>,
  eqH: (a:H,b:H)=>boolean
): FiniteGroup<H> {
  const { source: G, target: HH, f } = hom;
  if (!G || !G.elems) throw new Error("Source group missing or invalid");
  const elems: H[] = [];
  for (const g of G.elems) {
    const h = f(g);
    if (!elems.some(x => eqH(x,h))) elems.push(h);
  }
  const result: FiniteGroup<H> = {
    elems,
    op: HH.op,
    id: (HH as any).e ?? (HH as any).id,
    inv: HH.inv
  };
  if (HH.eq) (result as any).eq = HH.eq;
  (result as any).name = `im(${(hom as any).label || 'f'})`;
  return result;
}