// Kernels as equalizers in Grp.
// For f:G→H, ker(f) = { x∈G | f(x) = e_H } as normal subgroup, with inclusion i:ker(f)→G.
// Universal property: for any g:K→G with f∘g = const_e (i.e., factors through trivial map),
// there exists unique u:K→ker(f) with i∘u = g.

import { EnhancedGroup } from "./EnhancedGroup";
import { createEnhancedHom as mkHom } from "./Hom";
import type { GroupHom as EnhancedGroupHom } from "./Hom";

export function kernel<A,B>(f: EnhancedGroupHom<A,B>): {
  K: EnhancedGroup<A>,
  include: EnhancedGroupHom<A,A>,
  isKernel: <K0>(K0: EnhancedGroup<K0>, g: EnhancedGroupHom<K0,A>) => {
    mediating?: EnhancedGroupHom<K0,A>,
    unique?: (u: EnhancedGroupHom<K0,A>) => boolean
  }
} {
  const G = f.src, H = f.dst;
  if (!G || !H) throw new Error("Kernel: source and target groups must be defined");
  const H_e = H.id;

  // Build kernel as subgroup: {a ∈ G | f(a) = e_H}
  const kernelElems = G.elems ? 
    G.elems.filter(a => H.eq(f.run(a), H_e)) : 
    [G.id]; // fallback for infinite case

  const K: EnhancedGroup<A> = {
    carrier: "finite",
    elems: kernelElems,
    eq: G.eq,
    op: G.op, // inherited from G (kernel is subgroup)
    e: G.id,   // same identity
    inv: G.inv, // inherited inverse
    laws: (G as any).laws // inherit laws from G (if available)
  } as any;

  const include: EnhancedGroupHom<A,A> = mkHom(K, G, (a:A) => a);

  const isKernel = <K0>(K0: EnhancedGroup<K0>, g: EnhancedGroupHom<K0,A>) => {
    // condition: f ∘ g = const_e (g maps into kernel)
    if (!K0.elems) return {}; // can't verify for infinite case
    
    const cond = K0.elems.every(k => H.eq(f.run(g.run(k)), H_e));
    if (!cond) return {};
    
    const mediating: EnhancedGroupHom<K0,A> = mkHom(K0, K, (k: K0) => g.run(k));
    
    const unique = (u: EnhancedGroupHom<K0,A>) => {
      if (!K0.elems) return true;
      return K0.elems.every(k => G.eq(u.run(k), mediating.run(k)));
    };
    
    return { mediating, unique };
  };

  return { K, include, isKernel };
}