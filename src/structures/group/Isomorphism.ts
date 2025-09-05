import { FiniteGroup } from "./Group";
import { GroupHom } from "./GrpCat";
import { must, idx } from "../../util/guards";

/** Subgroup inclusion ι : H ↪ G (carriers share the same A; H.elems ⊆ G.elems). */
export function inclusion<A>(H: FiniteGroup<A>, G: FiniteGroup<A>): GroupHom<A,A> {
  // quick sanity: every H-elem must appear in G
  for (const h of H.elems) if (!G.elems.some(g => G.eq(g,h))) {
    throw new Error("inclusion: H is not a subgroup of G over the same carrier.");
  }
  return {
    source: H,
    target: G,
    f: (h: A) => h,               // identity on the underlying carrier
    verify: () => {
      for (const x of H.elems) for (const y of H.elems) {
        const left  = inclusion(H,G).f(H.op(x,y));
        const right = G.op(inclusion(H,G).f(x), inclusion(H,G).f(y));
        if (!G.eq(left, right)) return false;
      }
      return true;
    }
  };
}

/** Is a function f : G→H a group homomorphism (exhaustive on finite carriers)? */
export function isHom<A,B>(G: FiniteGroup<A>, H: FiniteGroup<B>, f: (a:A)=>B): boolean {
  for (const x of G.elems) for (const y of G.elems) {
    const lhs = f(G.op(x,y));
    const rhs = H.op(f(x), f(y));
    if (!H.eq(lhs, rhs)) return false;
  }
  // identity & inverse preservation follow from the law above in groups, but we can check:
  if (!H.eq(f(G.id), H.id)) return false;
  for (const x of G.elems) if (!H.eq(f(G.inv(x)), H.inv(f(x)))) return false;
  return true;
}

/** Check bijection between finite carriers. Returns inverse witness if bijective. */
export function bijectionWitness<A,B>(
  G: FiniteGroup<A>, H: FiniteGroup<B>, f: (a:A)=>B
): null | ((b:B)=>A) {
  const images = new Map<string,A>();
  const seenB: B[] = [];
  const keyB = (b:B) => JSON.stringify(b); // OK for our small numeric/array reps
  for (const a of G.elems) {
    const b = f(a);
    const k = keyB(b);
    if (images.has(k)) return null;  // not injective
    images.set(k, a);
    if (!H.elems.some(bb => H.eq(bb,b))) return null; // value outside H
    if (!seenB.some(bb => H.eq(bb, b))) seenB.push(b);
  }
  // surjective: every b in H has some a with f(a)=b
  for (const b of H.elems) {
    const k = keyB(b);
    if (!images.has(k)) return null;
  }
  // inverse: for any b choose an a with f(a)=b
  const inv = (b:B) => {
    const k = keyB(b);
    const a = images.get(k);
    if (a === undefined) throw new Error("inverse undefined (not bijection)");
    return a;
  };
  return inv;
}

/** Isomorphism check. Returns inverse witness when f is a group isomorphism. */
export function isIsomorphism<A,B>(
  G: FiniteGroup<A>, H: FiniteGroup<B>, f: (a:A)=>B
): null | ((b:B)=>A) {
  if (!isHom(G,H,f)) return null;
  const inv = bijectionWitness(G,H,f);
  if (!inv) return null;
  // Optionally check that inv is a hom H→G too (it must be for groups when f is bijective hom).
  if (!isHom(H,G,inv)) return null;
  return inv;
}

/** Small, brute-force automorphism enumerator (safe for |G| ≤ 8). */
export function automorphismsBruteforce<A>(G: FiniteGroup<A>): Array<GroupHom<A,A>> {
  const n = G.elems.length;
  if (n > 8) throw new Error("automorphismsBruteforce: set too large; use a specialized routine.");
  // enumerate permutations as arrays of indices
  const indices = [...Array(n).keys()];
  const perms: number[][] = [];
  const permute = (arr: number[], l=0) => {
    if (l === arr.length) { perms.push(arr.slice()); return; }
    for (let i=l;i<arr.length;i++){
      const lVal = idx(arr, l);
      const iVal = idx(arr, i);
      [arr[l],arr[i]]=[iVal,lVal];
      permute(arr,l+1);
      [arr[l],arr[i]]=[lVal,iVal];
    }
  };
  permute(indices);

  const autos: Array<GroupHom<A,A>> = [];
  for (const p of perms) {
    const map = (a:A) => {
      const i = G.elems.findIndex(x => G.eq(x,a));
      const permIdx = idx(p, i);
      return idx(G.elems, permIdx);
    };
    if (isHom(G,G,map) && bijectionWitness(G,G,map)) {
      autos.push({ source: G, target: G, f: map, verify: () => true });
    }
  }
  return autos;
}