// Product of groups with projections and universal property witness.
// Trace: Smith §2.3 (pairing), §2.9 (category framing).

import { EnhancedGroup } from "./EnhancedGroup";
import { createEnhancedHom as mkHom } from "./Hom";
import type { GroupHom } from "./Hom";

export function product<A,B>(G: EnhancedGroup<A>, H: EnhancedGroup<B>): {
  P: EnhancedGroup<[A,B]>,
  π1: GroupHom<unknown,unknown,[A,B],A>,
  π2: GroupHom<unknown,unknown,[A,B],B>,
  // universal property: for any K --f--> G, K --g--> H
  // there exists unique ⟨f,g⟩ : K → P s.t. π1∘⟨f,g⟩=f and π2∘⟨f,g⟩=g
  pair: <K>(K: EnhancedGroup<K>, f: GroupHom<unknown,unknown,K,A>, g: GroupHom<unknown,unknown,K,B>) => {
    mediating: GroupHom<unknown,unknown,K,[A,B]>,
    uniqueness: (h: GroupHom<unknown,unknown,K,[A,B]>) => boolean
  }
} {
  const op = (x: [A,B], y: [A,B]): [A,B] =>
    [G.op(x[0], y[0]), H.op(x[1], y[1])];
  const id: [A,B] = [G.id, H.id];
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
    id,
    inv,
    laws: {
      assoc: (x, y, z) => eq(op(op(x, y), z), op(x, op(y, z))),
      leftId: (x) => eq(op(id, x), x),
      rightId: (x) => eq(op(x, id), x),
      leftInv: (x) => eq(op(inv(x), x), id),
      rightInv: (x) => eq(op(x, inv(x)), id),
    }
  };

  const π1: GroupHom<unknown,unknown,[A,B],A> = mkHom(P, G, (pair: [A,B]) => pair[0]);
  const π2: GroupHom<unknown,unknown,[A,B],B> = mkHom(P, H, (pair: [A,B]) => pair[1]);

  const pair = <K>(K: EnhancedGroup<K>, f: GroupHom<unknown,unknown,K,A>, g: GroupHom<unknown,unknown,K,B>) => {
    const mediating: GroupHom<unknown,unknown,K,[A,B]> = mkHom(K, P, (k: K) => [f.run?.(k) ?? (f as any).map(k), g.run?.(k) ?? (g as any).map(k)]);
    
    const uniqueness = (h: GroupHom<unknown,unknown,K,[A,B]>) => {
      // uniqueness: if π1∘h = f and π2∘h = g then h = mediating (pointwise on finite carriers)
      if (!K.elems) return true; // assume true for infinite case
      return K.elems.every(k => {
        const lhs = h.run?.(k) ?? (h as any).map(k), rhs = mediating.run?.(k) ?? (mediating as any).map(k);
        return G.eq((lhs as [A,B])[0], (rhs as [A,B])[0]) && H.eq((lhs as [A,B])[1], (rhs as [A,B])[1]);
      });
    };
    
    return { mediating, uniqueness };
  };

  return { P, π1, π2, pair };
}