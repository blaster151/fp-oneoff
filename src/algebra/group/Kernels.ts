// Kernels as equalizers in Grp.
// For f:G→H, ker(f) = { x∈G | f(x) = e_H } as normal subgroup, with inclusion i:ker(f)→G.
// Universal property: for any g:K→G with f∘g = const_e (i.e., factors through trivial map),
// there exists unique u:K→ker(f) with i∘u = g.

import { FiniteGroup, eqOf } from "./Group";
import { hom } from "./Hom";
import type { GroupHom } from "./Hom";

export function kernel<A,B>(f: GroupHom<unknown,unknown,A,B>): {
  K: FiniteGroup<A>,
  include: GroupHom<unknown,unknown,A,A>,
  isKernel: <K0>(K0: FiniteGroup<K0>, g: GroupHom<unknown,unknown,K0,A>) => {
    mediating?: GroupHom<unknown,unknown,K0,A>,
    unique?: (u: GroupHom<unknown,unknown,K0,A>) => boolean
  }
} {
  const G = f.source, H = f.target;
  if (!G || !H) throw new Error("Kernel: source and target groups must be defined");
  const H_e = H.id;

  // Build kernel as subgroup: {a ∈ G | f(a) = e_H}
  const eqH = eqOf(H);
  const kernelElems = G.elems.filter(a => eqH(f.map(a), H_e));

  const K: FiniteGroup<A> = {
    elems: kernelElems,
    eq: G.eq,
    op: G.op, // inherited from G (kernel is subgroup)
    id: G.id,   // same identity
    inv: G.inv, // inherited inverse
    name: `ker(${(f as any).name || 'f'})`
  };

  const include: GroupHom<unknown,unknown,A,A> = hom(K, G, (a:A) => a, "ι");

  const isKernel = <K0>(K0: FiniteGroup<K0>, g: GroupHom<unknown,unknown,K0,A>) => {
    // condition: f ∘ g = const_e (g maps into kernel)
    const cond = K0.elems.every(k => eqH(f.map(g.map(k)), H_e));
    if (!cond) return {};
    
    const mediating: GroupHom<unknown,unknown,K0,A> = hom(K0, K, (k: K0) => g.map(k), "u");
    
    const unique = (u: GroupHom<unknown,unknown,K0,A>) => {
      const eqG = eqOf(G);
      return K0.elems.every(k => eqG(u.map(k), mediating.map(k)));
    };
    
    return { mediating, unique };
  };

  return { K, include, isKernel };
}