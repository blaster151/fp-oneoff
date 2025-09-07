import { EnhancedGroup } from "../../algebra/group/EnhancedGroup";
import { EnhancedGroupHom, composeHom, idHom } from "../../algebra/group/EnhancedGroupHom";

// Objects are EnhancedGroup<A>; morphisms are EnhancedGroupHom<A,B>
export type GObj<A> = EnhancedGroup<A>;
export type GMor<A, B> = EnhancedGroupHom<A, B>;

export const GroupCategory = {
  id: <A>(G: GObj<A>): GMor<A, A> => idHom(G),
  compose:
    <A, B, C>(g: GMor<B, C>, f: GMor<A, B>): GMor<A, C> =>
      composeHom(g, f),

  // equality of morphisms for testing (extensional on all elems when available; fallback to sample)
  eqMor<A, B>(f: GMor<A, B>, g: GMor<A, B>): boolean {
    const G = f.src;
    if (G.elems) {
      return G.elems.every(a => f.dst.eq(f.run(a), g.run(a)));
    }
    // coarse fallback: check identity + a few derived points
    const samples: A[] = [G.e, G.inv(G.e)];
    return samples.every(a => f.dst.eq(f.run(a), g.run(a)));
  }
};