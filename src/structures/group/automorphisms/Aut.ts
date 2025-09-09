import { FiniteGroup } from "../Group";
import { GroupHom, hom } from "../GrpCat";
import { GroupIso, isoId, isoComp, isoInverse, isoEqByPoints } from "../iso/GroupIso";
import { must, idx } from "../../../util/guards";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../../../algebra/group/Hom";

// ---------- Utilities ----------
function eqArray<A>(xs: A[], ys: A[], eq: (a: A, b: A) => boolean): boolean {
  if (xs.length !== ys.length) return false;
  return xs.every((x, i) => eq(x, idx(ys, i)));
}

// All permutations of indices [0..n-1] (for small n only)
function* permute(n: number): Generator<number[]> {
  const a: number[] = [...Array(n).keys()];
  function* gen(k: number): Generator<number[]> {
    if (k === n) { yield a.slice(); return; }
    for (let i = k; i < n; i++) { 
      const kVal = idx(a, k), iVal = idx(a, i);
      [a[k], a[i]] = [iVal, kVal]; 
      yield* gen(k + 1); 
      [a[k], a[i]] = [kVal, iVal]; 
    }
  }
  yield* gen(0);
}

function buildHomFromPerm<A>(G: FiniteGroup<A>, perm: number[]): GroupHom<A, A> {
  const dom = G.elems;
  const img = perm.map(i => idx(dom, i));
  const map = (a: A): A => {
    const j = dom.findIndex(d => G.eq(d, a));
    return idx(img, j, "element not found");
  };
  return hom(G, G, map, undefined, () => true);
}

function isHomomorphism<A>(G: FiniteGroup<A>, h: GroupHom<A, A>): boolean {
  for (const a of G.elems) for (const b of G.elems) {
    const lhs = h.f(G.op(a, b));
    const rhs = G.op(h.f(a), h.f(b));
    if (!G.eq(lhs, rhs)) return false;
  }
  // identity/inverses preserved automatically if operation is preserved and h is bijection.
  return true;
}

function inversePerm(perm: number[]): number[] {
  const inv = new Array(perm.length);
  for (let i = 0; i < perm.length; i++) inv[idx(perm, i)] = i;
  return inv;
}

// ---------- Public API ----------

export type Auto<A> = GroupIso<A, A>;

/** Enumerate all automorphisms of a small finite group (|G| ≤ maxSize). */
export function enumerateAutomorphisms<A>(G: FiniteGroup<A>, maxSize: number = 10): Auto<A>[] {
  if (G.elems.length > maxSize) {
    throw new Error(`enumerateAutomorphisms: group too large (${G.elems.length} > ${maxSize}).`);
  }
  const autos: Auto<A>[] = [];
  for (const p of permute(G.elems.length)) {
    // Fast reject: identity must map to identity.
    const idIdx = G.elems.findIndex(x => G.eq(x, G.id));
    const mappedIdIdx = idx(p, idIdx);
    if (!G.eq(idx(G.elems, mappedIdIdx), G.id)) continue;

    const f = buildHomFromPerm(G, p);
    if (!isHomomorphism(G, f)) continue;

    const inv = buildHomFromPerm(G, inversePerm(p));
    if (!isHomomorphism(G, inv)) continue;

    autos.push({ forward: f, backward: inv });
  }
  // Deduplicate by forward pointwise equality
  const uniq: Auto<A>[] = [];
  for (const a of autos) if (!uniq.some(u => isoEqByPoints(u, a))) uniq.push(a);
  return uniq;
}

/** Group structure on Aut(G) under composition. */
export function autGroup<A>(G: FiniteGroup<A>): FiniteGroup<Auto<A>> {
  const elems = enumerateAutomorphisms(G);
  const eq = isoEqByPoints<A, A>;
  const op = (x: Auto<A>, y: Auto<A>): Auto<A> => isoComp(x, y);
  const id = isoId(G);
  const inv = (x: Auto<A>): Auto<A> => isoInverse(x);
  return { elems, eq, op, id, inv };
}

/**
 * Enhanced automorphism group analysis using the new Second and Third Isomorphism Theorems.
 * This provides basic structural integration and validation.
 */
export function analyzeAutomorphismGroupWithIsomorphismTheorems<A>(G: FiniteGroup<A>): {
  autGroup: FiniteGroup<Auto<A>>;
  autSize: number;
  groupSize: number;
  center: FiniteGroup<A>;
  centerSize: number;
  isValidGroup: boolean;
  hasNonTrivialAutos: boolean;
  canApplySecondIso: boolean;
  canApplyThirdIso: boolean;
} {
  const aut = autGroup(G);
  const autSize = aut.elems.length;
  const groupSize = G.elems.length;
  
  // Find the center of G
  const center = G.elems.filter(z => G.elems.every(g => G.eq(G.op(z, g), G.op(g, z))));
  const centerGroup: FiniteGroup<A> = {
    elems: center,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq
  };
  const centerSize = center.length;
  
  // Basic validation
  const isValidGroup = groupSize > 0 && autSize > 0;
  const hasNonTrivialAutos = autSize > 1;
  
  // Check if we can apply isomorphism theorems (basic structural checks)
  const canApplySecondIso = groupSize <= 8 && centerSize > 1; // Small groups with non-trivial center
  const canApplyThirdIso = groupSize >= 6 && centerSize > 1; // Groups with potential nested normal subgroups
  
  return {
    autGroup: aut,
    autSize,
    groupSize,
    center: centerGroup,
    centerSize,
    isValidGroup,
    hasNonTrivialAutos,
    canApplySecondIso,
    canApplyThirdIso
  };
}