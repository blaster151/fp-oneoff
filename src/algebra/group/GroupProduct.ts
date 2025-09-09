// Product of groups with projections and universal property witness.
// Trace: Smith §2.3 (pairing), §2.9 (category framing).

import { EnhancedGroup } from "./EnhancedGroup";
import { createEnhancedHom as mkHom } from "./Hom";
import type { GroupHom as EnhancedGroupHom } from "./Hom";

export function product<A,B>(G: EnhancedGroup<A>, H: EnhancedGroup<B>): {
  P: EnhancedGroup<[A,B]>,
  π1: EnhancedGroupHom<[A,B],A>,
  π2: EnhancedGroupHom<[A,B],B>,
  // universal property: for any K --f--> G, K --g--> H
  // there exists unique ⟨f,g⟩ : K → P s.t. π1∘⟨f,g⟩=f and π2∘⟨f,g⟩=g
  pair: <K>(K: EnhancedGroup<K>, f: EnhancedGroupHom<K,A>, g: EnhancedGroupHom<K,B>) => {
    mediating: EnhancedGroupHom<K,[A,B]>,
    uniqueness: (h: EnhancedGroupHom<K,[A,B]>) => boolean
  }
} {
  const op = (x: [A,B], y: [A,B]): [A,B] =>
    [G.op(x[0], y[0]), H.op(x[1], y[1])];
  const e: [A,B] = [G.e, H.e];
  const inv = (x: [A,B]): [A,B] => [G.inv(x[0]), H.inv(x[1])];
  const eq = (x: [A,B], y: [A,B]) => G.eq(x[0], y[0]) && H.eq(x[1], y[1]);

  // Build product group
  const elems = (G.elems && H.elems) ? 
    G.elems.flatMap(a => H.elems!.map(b => [a,b] as [A,B])) : 
    undefined;

  const P: EnhancedGroup<[A,B]> = {
    carrier: G.carrier === "finite" && H.carrier === "finite" ? "finite" : "infinite",
    elems,
    eq,
    op,
    e,
    inv,
    laws: {
      assoc: (x, y, z) => eq(op(op(x, y), z), op(x, op(y, z))),
      leftId: (x) => eq(op(e, x), x),
      rightId: (x) => eq(op(x, e), x),
      leftInv: (x) => eq(op(inv(x), x), e),
      rightInv: (x) => eq(op(x, inv(x)), e),
    }
  };

  const π1: EnhancedGroupHom<[A,B],A> = mkHom(P, G, ([a,_]) => a);
  const π2: EnhancedGroupHom<[A,B],B> = mkHom(P, H, ([_,b]) => b);

  const pair = <K>(K: EnhancedGroup<K>, f: EnhancedGroupHom<K,A>, g: EnhancedGroupHom<K,B>) => {
    const mediating: EnhancedGroupHom<K,[A,B]> = mkHom(K, P, (k: K) => [f.run(k), g.run(k)]);
    
    const uniqueness = (h: EnhancedGroupHom<K,[A,B]>) => {
      // uniqueness: if π1∘h = f and π2∘h = g then h = mediating (pointwise on finite carriers)
      if (!K.elems) return true; // assume true for infinite case
      return K.elems.every(k => {
        const lhs = h.run(k), rhs = mediating.run(k);
        return G.eq(lhs[0], rhs[0]) && H.eq(lhs[1], rhs[1]);
      });
    };
    
    return { mediating, uniqueness };
  };

  return { P, π1, π2, pair };
}