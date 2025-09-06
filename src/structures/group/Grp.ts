import type { FiniteGroup } from "./Group";
import {
  GroupHom, hom, idHom, compose,
  productGroup, proj1, proj2, pairIntoProduct
} from "./GrpCat";

/** Objects = finite groups, Morphisms = homomorphisms */
export type Obj<T> = FiniteGroup<T>;
export type Mor<A,B> = GroupHom<A,B>;

/** Category structure (just enough for tests) */
export const Grp = {
  id: idHom,
  comp: compose,

  /** Categorical product data */
  product<A,B>(G: Obj<A>, H: Obj<B>) {
    const P = productGroup(G, H);
    const π1 = proj1(G, H);
    const π2 = proj2(G, H);

    /** Mediating arrow for any cone (u:K→G, v:K→H) */
    function pair<K>(K: Obj<K>, u: Mor<K,A>, v: Mor<K,B>): Mor<K,[A,B]> {
      const pairHom = pairIntoProduct(K, G, H, u, v);
      // Add a uniqueAgainst method for testing
      (pairHom as any).uniqueAgainst = (other: Mor<K,[A,B]>) => {
        // Check that both have the same projections
        for (const k of K.elems) {
          const ab1 = pairHom.f(k);
          const ab2 = other.f(k);
          if (!G.eq(π1.f(ab1), π1.f(ab2)) || !H.eq(π2.f(ab1), π2.f(ab2))) {
            return false;
          }
        }
        return true;
      };
      return pairHom;
    }

    return { P, π1, π2, pair };
  },
};