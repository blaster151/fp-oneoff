import { FiniteGroup } from "../Group";
import { GroupHom } from "../GrpCat";
import { isIsomorphism } from "../Isomorphism";
import { kernel, image, quotientGroup } from "../builders/Quotient";

/** The canonical isomorphism \bar f : G/ker f → im f, plus data. */
export function firstIsomorphism<A, B>(f: GroupHom<A, B>): {
  quotient: FiniteGroup<{ rep: A }>;
  img: FiniteGroup<B>;
  phi: GroupHom<{ rep: A }, B>;  // onto im f
  isIso: boolean;
} {
  const G = f.source;
  const ker = kernel(f);
  const Q = quotientGroup(G, ker);
  const Im = image(f);

  // define \bar f([a]) = f(a)
  const phi: GroupHom<{ rep: A }, B> = {
    source: Q,
    target: Im,
    f: (c) => {
      const b = f.f(c.rep);
      // normalize to canonical element in Im.elems (by equality)
      const found = Im.elems.find(x => Im.eq(x, b));
      return found ?? b;
    }
  };

  return { quotient: Q, img: Im, phi, isIso: isIsomorphism(Q, Im, phi.f) !== null };
}