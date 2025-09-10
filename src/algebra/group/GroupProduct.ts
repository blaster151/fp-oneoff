// Product of groups with projections and universal property witness.
// Trace: Smith §2.3 (pairing), §2.9 (category framing).

import { FiniteGroup } from "./Group";
import { hom } from "./Hom";
import type { GroupHom } from "./Hom";

export function product<A,B>(G: FiniteGroup<A>, H: FiniteGroup<B>): {
  P: FiniteGroup<[A,B]>,
  π1: GroupHom<unknown,unknown,[A,B],A>,
  π2: GroupHom<unknown,unknown,[A,B],B>,
  // universal property: for any K --f--> G, K --g--> H
  // there exists unique ⟨f,g⟩ : K → P s.t. π1∘⟨f,g⟩=f and π2∘⟨f,g⟩=g
  pair: <K>(K: FiniteGroup<K>, f: GroupHom<unknown,unknown,K,A>, g: GroupHom<unknown,unknown,K,B>) => {
    mediating: GroupHom<unknown,unknown,K,[A,B]>,
    uniqueness: (h: GroupHom<unknown,unknown,K,[A,B]>) => boolean
  }
} {
  const op = (x: [A,B], y: [A,B]): [A,B] =>
    [G.op(x[0], y[0]), H.op(x[1], y[1])];
  const id: [A,B] = [G.id, H.id];
  const inv = (x: [A,B]): [A,B] => [G.inv(x[0]), H.inv(x[1])];
  
  const eqG = G.eq ?? ((x: A, y: A) => x === y);
  const eqH = H.eq ?? ((x: B, y: B) => x === y);
  const eq = (x: [A,B], y: [A,B]) => eqG(x[0], y[0]) && eqH(x[1], y[1]);

  // Build product group
  const elems: Array<[A,B]> = [];
  for (const a of G.elems) {
    for (const b of H.elems) {
      elems.push([a, b]);
    }
  }

  const P: FiniteGroup<[A,B]> = {
    elems,
    eq,
    op,
    id,
    inv,
    name: `${G.name || 'G'}×${H.name || 'H'}`
  };

  const π1: GroupHom<unknown,unknown,[A,B],A> = hom(P, G, (pair: [A,B]) => pair[0], "π1");
  const π2: GroupHom<unknown,unknown,[A,B],B> = hom(P, H, (pair: [A,B]) => pair[1], "π2");

  const pair = <K>(K: FiniteGroup<K>, f: GroupHom<unknown,unknown,K,A>, g: GroupHom<unknown,unknown,K,B>) => {
    const mediating: GroupHom<unknown,unknown,K,[A,B]> = hom(K, P, (k: K) => [f.map(k), g.map(k)], "⟨f,g⟩");
    
    const uniqueness = (h: GroupHom<unknown,unknown,K,[A,B]>) => {
      // uniqueness: if π1∘h = f and π2∘h = g then h = mediating (pointwise on finite carriers)
      return K.elems.every(k => {
        const lhs = h.map(k);
        const rhs = mediating.map(k);
        return eqG(lhs[0], rhs[0]) && eqH(lhs[1], rhs[1]);
      });
    };
    
    return { mediating, uniqueness };
  };

  return { P, π1, π2, pair };
}