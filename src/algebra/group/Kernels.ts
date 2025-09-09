// Kernels as equalizers in Grp.
// For f:G→H, ker(f) = { x∈G | f(x) = e_H } as normal subgroup, with inclusion i:ker(f)→G.
// Universal property: for any g:K→G with f∘g = const_e (i.e., factors through trivial map),
// there exists unique u:K→ker(f) with i∘u = g.

import { EnhancedGroup } from "./EnhancedGroup";
import { createEnhancedHom as mkHom } from "./Hom";
import type { GroupHom } from "./Hom";

export function kernel<A,B>(f: GroupHom<unknown,unknown,A,B>): {
  K: EnhancedGroup<A>,
  include: GroupHom<unknown,unknown,A,A>,
  isKernel: <K0>(K0: EnhancedGroup<K0>, g: GroupHom<unknown,unknown,K0,A>) => {
    mediating?: GroupHom<unknown,unknown,K0,A>,
    unique?: (u: GroupHom<unknown,unknown,K0,A>) => boolean
  }
} {
  const G = f.src, H = f.dst;
  if (!G || !H) throw new Error("Kernel: source and target groups must be defined");
  const H_e = H.id;

  // Build kernel as subgroup: {a ∈ G | f(a) = e_H}
  const eqH = H.eq || ((a: any, b: any) => a === b);
  const kernelElems = G.elems ? 
    G.elems.filter(a => eqH((f as any).run?.(a) ?? (f as any).map(a), H_e)) : 
    [G.id]; // fallback for infinite case

  const K: EnhancedGroup<A> = {
    carrier: "finite",
    elems: kernelElems,
    eq: G.eq,
    op: G.op, // inherited from G (kernel is subgroup)
    id: G.id,   // same identity
    inv: G.inv, // inherited inverse
    laws: (G as any).laws // inherit laws from G (if available)
  } as any;

  const include: GroupHom<unknown,unknown,A,A> = mkHom(K, G, (a:A) => a);

  const isKernel = <K0>(K0: EnhancedGroup<K0>, g: GroupHom<unknown,unknown,K0,A>) => {
    // condition: f ∘ g = const_e (g maps into kernel)
    if (!K0.elems) return {}; // can't verify for infinite case
    
    const cond = K0.elems.every(k => eqH((f as any).run?.((g as any).run?.(k) ?? (g as any).map(k)) ?? (f as any).map((g as any).run?.(k) ?? (g as any).map(k)), H_e));
    if (!cond) return {};
    
    const mediating: GroupHom<unknown,unknown,K0,A> = mkHom(K0, K, (k: K0) => (g as any).run?.(k) ?? (g as any).map(k));
    
    const unique = (u: GroupHom<unknown,unknown,K0,A>) => {
      if (!K0.elems) return true;
      const eqG = G.eq || ((a: any, b: any) => a === b);
      return K0.elems.every(k => eqG((u as any).run?.(k) ?? (u as any).map(k), (mediating as any).run?.(k) ?? (mediating as any).map(k)));
    };
    
    return { mediating, unique };
  };

  return { K, include, isKernel };
}