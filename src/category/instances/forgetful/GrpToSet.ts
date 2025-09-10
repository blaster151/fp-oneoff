// Traceability: Smith §2.9(d) – forgetful functor to Set (carriers).

import { Functor } from "../../core/Category";
import { Grp, GrpObj, GrpHom } from "../Grp";

export type SetObj<A=any> = { carrier: Set<A> };
export type SetHom = { source: SetObj; target: SetObj; fn: (x:any)=>any };

export const SetCat = {
  id: (X: SetObj): SetHom => ({ source: X, target: X, fn: (x:any)=>x }),
  compose: (h: SetHom, g: SetHom): SetHom =>
    ({ source: g.source, target: h.target, fn: (x:any) => h.fn(g.fn(x)) })
};

export const U_Grp_to_Set = {
  source: Grp as any,
  target: SetCat as any,
  onObj: (G: GrpObj): SetObj => ({ carrier: new Set(G.G.elems) }),
  onMor: (f: GrpHom): SetHom => ({ 
    source: { carrier: new Set(f.source.G.elems) },
    target: { carrier: new Set(f.target.G.elems) },
    fn: f.map 
  })
};
