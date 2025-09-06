// Smith §2.7 Thm 9: kernel-pair relation from a hom is a congruence.
// A congruence ≈ on a group (G,*,e) is an equivalence relation
// compatible with * on both sides: x≈y ⇒ z*x≈z*y and x*z≈y*z.

export type Equiv<G> = (x: G, y: G) => boolean;

export interface EnhancedCongruence<G> {
  readonly eq: Equiv<G>;
}

export function isEnhancedCongruence<G>(
  elems: readonly G[],
  op: (a:G,b:G)=>G,
  eq: Equiv<G>
): boolean {
  // reflexive + symmetric + (optional) transitive spot-check
  for (const x of elems) if (!eq(x,x)) return false;
  for (const x of elems) for (const y of elems) {
    if (eq(x,y) !== eq(y,x)) return false;
  }
  // Compatibility left/right
  for (const x of elems) for (const y of elems) if (eq(x,y)) {
    for (const z of elems) {
      if (!eq(op(z,x), op(z,y))) return false;
      if (!eq(op(x,z), op(y,z))) return false;
    }
  }
  return true;
}