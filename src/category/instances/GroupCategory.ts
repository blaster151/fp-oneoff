import { EnhancedGroup } from "../../algebra/group/EnhancedGroup";
import { composeHom, idHom } from "../../algebra/group/Hom";
import type { GroupHom } from "../../algebra/group/Hom";
type EnhancedGroupHom<A, B> = GroupHom<unknown, unknown, A, B>;
import { Category } from "../core/Category";

// Objects are EnhancedGroup<A>; morphisms are EnhancedGroupHom<A,B>
export type GObj<A> = EnhancedGroup<A>;
export type GMor<A, B> = EnhancedGroupHom<A, B>;

export const GroupCategory: Category<GObj<any>, GMor<any, any>> = {
  id: <A>(G: GObj<A>): GMor<A, A> => idHom(G),
  compose:
    <A, B, C>(g: GMor<B, C>, f: GMor<A, B>): GMor<A, C> =>
      composeHom(g, f),

  // equality of morphisms for testing (extensional on all elems when available; fallback to sample)
  eqMor<A, B>(f: GMor<A, B>, g: GMor<A, B>): boolean {
    const G = f.source;
    if (G.elems) {
      return G.elems.every(a => f.target.eq(f.map(a), g.map(a)));
    }
    // coarse fallback: check identity + a few derived points
    const samples: A[] = [G.id, G.inv(G.id)];
    return samples.every(a => f.target.eq(f.map(a), g.map(a)));
  }
};