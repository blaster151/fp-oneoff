import type { FiniteGroup } from "./Group";
import {
  GroupHom, hom, idHom, comp,
  productGroup, proj1, proj2, pairIntoProduct
} from "./GrpCat";

/** Objects = finite groups, Morphisms = homomorphisms */
export type Obj<T> = FiniteGroup<T>;
export type Mor<A,B> = GroupHom<A,B>;

/** Category structure (just enough for tests) */
export const Grp = {
  id: idHom,
  comp,

  /** Categorical product data */
  product<A,B>(G: Obj<A>, H: Obj<B>) {
    const P = productGroup(G, H);
    const π1 = proj1(G, H);
    const π2 = proj2(G, H);

    /** Mediating arrow for any cone (u:K→G, v:K→H) */
    function pair<K>(K: Obj<K>, u: Mor<K,A>, v: Mor<K,B>): Mor<K,[A,B]> {
      return pairIntoProduct(K, G, H, u, v);
    }

    return { P, π1, π2, pair };
  },
};