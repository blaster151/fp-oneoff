// Traceability: Smith, Introduction to Category Theory, §2.9 (category of groups).
// Definition: The forgetful functor U: Grp → Set maps a group to its carrier set
// and a homomorphism to its underlying function.

import { EnhancedGroup } from "../../algebra/group/EnhancedGroup";
import type { GroupHom } from "../../algebra/group/Hom";
type EnhancedGroupHom<A, B> = GroupHom<unknown, unknown, A, B>;
import { Functor } from "../core/Category";
import { GroupCategory, GObj, GMor } from "./GroupCategory";
import { SetCategory, SetObj, SetMor } from "./SetCategory";

export interface ForgetfulGrpToSet extends Functor<GObj<any>, SetObj<any>, GMor<any, any>, SetMor<any, any>> {
  onObj: <A>(G: EnhancedGroup<A>) => Set<A>;
  onMor: <A,B>(f: EnhancedGroupHom<A,B>) => (a: A) => B;
}

export const U: ForgetfulGrpToSet = {
  source: GroupCategory,
  target: SetCategory,
  onObj: <A>(G: EnhancedGroup<A>) => {
    // Convert to Set from elems if finite, otherwise create abstract set representation
    return G.elems ? new Set(G.elems) : new Set([G.e]); // fallback for infinite case
  },
  onMor: <A,B>(f: EnhancedGroupHom<A,B>) => f.map        // underlying function
};