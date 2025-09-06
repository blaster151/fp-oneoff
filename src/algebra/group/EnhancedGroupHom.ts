import { EnhancedFiniteGroup, EnhancedGroupHom } from "./EnhancedGroup";
import { EnhancedCongruence } from "./EnhancedCongruence";
import { enhancedQuotientGroup } from "./EnhancedQuotientGroup";

export function enhancedGroupHom<G,H>(
  G: EnhancedFiniteGroup<G>, H: EnhancedFiniteGroup<H>, map: (g:G)=>H
): EnhancedGroupHom<G,H> {
  const self: EnhancedGroupHom<G,H> = {
    G, H, map,

    factorization() {
      // Kernel-pair congruence: x ~ y iff f(x)=f(y)
      const cong: EnhancedCongruence<G> = { eq: (x,y) => H.show
        ? H.show!(map(x)) === H.show!(map(y))
        : map(x) === map(y) // fallback (best-effort); tests will use show or deep eq
      };

      const Q = enhancedQuotientGroup(G, cong);
      const quotient = Q.Group;
      const pi = (g:G) => Q.norm(g);
      const iota = (q:{rep:G}) => map(q.rep);

      const law_compose_equals_f = (g:G) => {
        const lhs = iota(pi(g));
        const rhs = map(g);
        if (H.show) return H.show(lhs) === H.show(rhs);
        return lhs === rhs;
      };

      return { quotient, pi, iota, law_compose_equals_f };
    }
  };
  return self;
}