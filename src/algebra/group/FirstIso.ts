import { Group, GroupHom } from "./structures";
import { congruenceFromHom } from "./Congruence";
import { QuotientGroup, Coset } from "./QuotientGroup";

/**
 * Given a hom f: G→H, build:
 *  - the congruence ≈_f (x≈y ⇔ f(x)=f(y))
 *  - the quotient group Q = G/≈_f
 *  - the canonical hom Φ: Q → im(f) (as a subgroup predicate of H)
 * For finite examples we verify Φ is an isomorphism by exhaustive check.
 */
export function firstIsomorphismData<G, H>(
  F: GroupHom<G, H>
) {
  const { source: G, target: H, map: f } = F;

  // 1) congruence
  const cong = congruenceFromHom(G, H, f);

  // 2) quotient
  const Q = QuotientGroup(cong);

  // 3) image predicate (extensible; for tests we pass finite carrier)
  const inImage = (h: H, support: G[]): boolean =>
    support.some(g => {
      const eqH = H.eq ?? ((a: H, b: H) => a === b);
      return eqH(f(g), h);
    });

  // 4) canonical hom Φ([g]) = f(g)
  const phi = (c: Coset<G>) => f(c.rep);

  // homomorphism laws hold by definition; we can provide a checker
  const respectsOp = (a: Coset<G>, b: Coset<G>) => {
    const eqH = H.eq ?? ((a: H, b: H) => a === b);
    return eqH(phi(Q.Group.op(a, b)), H.op(phi(a), phi(b)));
  };

  // For finite groups, we can also check injectivity and surjectivity
  const checkIsomorphism = (support: G[]) => {
    if (!Q.Group.elems || !H.elems) {
      return { injective: null, surjective: null, bijective: null };
    }

    // Check injectivity: if φ([g₁]) = φ([g₂]) then [g₁] = [g₂]
    let injective = true;
    for (const c1 of Q.Group.elems) {
      for (const c2 of Q.Group.elems) {
        const eqH = H.eq ?? ((a: H, b: H) => a === b);
        if (eqH(phi(c1), phi(c2)) && !Q.eqCoset(c1, c2)) {
          injective = false;
          break;
        }
      }
      if (!injective) break;
    }

    // Check surjectivity onto image: every element in im(f) has a preimage
    const imageElements = support.map(f);
    let surjective = true;
    for (const h of imageElements) {
      const hasPreimage = Q.Group.elems.some(c => {
        const eqH = H.eq ?? ((a: H, b: H) => a === b);
        return eqH(phi(c), h);
      });
      if (!hasPreimage) {
        surjective = false;
        break;
      }
    }

    return { injective, surjective, bijective: injective && surjective };
  };

  return { cong, quotient: Q, phi, respectsOp, inImage, checkIsomorphism };
}