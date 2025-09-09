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
 * This provides comprehensive witness data about the automorphism group's relationships
 * with the original group and its subgroups.
 */
export function analyzeAutomorphismGroupWithIsomorphismTheorems<A>(G: FiniteGroup<A>): {
  autGroup: FiniteGroup<Auto<A>>;
  autSize: number;
  groupSize: number;
  center: FiniteGroup<A>;
  centerSize: number;
  secondIsoExamples?: any[];
  thirdIsoExamples?: any[];
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
  
  const result: any = {
    autGroup: aut,
    autSize,
    groupSize,
    center: centerGroup,
    centerSize
  };
  
  // For small groups, demonstrate Second Isomorphism Theorem applications
  if (groupSize <= 8) {
    result.secondIsoExamples = [];
    
    // Example 1: Automorphism group with center
    if (centerSize > 1 && autSize > 1) {
      try {
        // Find a non-trivial element in the center
        const centerElement = center.find(z => !G.eq(z, G.id));
        if (centerElement) {
          const cyclicSubgroup = [G.id, centerElement];
          const secondIso = secondIsomorphismTheorem(G, cyclicSubgroup, center, "Aut-Center Analysis");
          result.secondIsoExamples.push({
            description: "Cyclic subgroup with center (affects automorphisms)",
            secondIsoData: secondIso.witnesses?.secondIsoData
          });
        }
      } catch (e) {
        // Ignore errors in examples
      }
    }
    
    // Example 2: Automorphism group with a different subgroup
    if (autSize > 1 && centerSize < groupSize) {
      try {
        // Find a non-center element to create a subgroup
        const nonCenterElement = G.elems.find(g => !center.some(z => G.eq(g, z)));
        if (nonCenterElement) {
          const otherSubgroup = [G.id, nonCenterElement];
          const secondIso = secondIsomorphismTheorem(G, otherSubgroup, center, "Aut-Other Analysis");
          result.secondIsoExamples.push({
            description: "Other subgroup with center (affects automorphisms)",
            secondIsoData: secondIso.witnesses?.secondIsoData
          });
        }
      } catch (e) {
        // Ignore errors in examples
      }
    }
  }
  
  // For groups with nested normal subgroups, demonstrate Third Isomorphism Theorem
  if (groupSize >= 6 && centerSize > 1) {
    result.thirdIsoExamples = [];
    
    try {
      // Find a proper normal subgroup containing the center
      const centerElements = center;
      const largerNormalSubgroup = G.elems.filter(g => {
        // Simple heuristic: elements that commute with many others
        const commutesWith = G.elems.filter(h => G.eq(G.op(g, h), G.op(h, g)));
        return commutesWith.length > centerSize;
      });
      
      if (largerNormalSubgroup.length > centerSize && largerNormalSubgroup.length < groupSize) {
        const thirdIso = thirdIsomorphismTheorem(G, centerElements, largerNormalSubgroup, "Aut-Normal Analysis");
        result.thirdIsoExamples.push({
          description: "Center within larger normal subgroup (affects automorphisms)",
          thirdIsoData: thirdIso.witnesses?.thirdIsoData
        });
      }
    } catch (e) {
      // Ignore errors in examples
    }
  }
  
  return result;
}