import { FiniteGroup } from "../../group/Group";
import { GroupHom } from "../../group/GrpCat";

/** Brute-force enumerate homomorphisms G→H for very small G,H (explodes quickly). */
export function enumerateHoms<A,B>(G: FiniteGroup<A>, H: FiniteGroup<B>, maxSize=9): GroupHom<A,B>[] {
  if (G.elems.length > maxSize || H.elems.length > maxSize) throw new Error("enumerateHoms: too large");

  // Enumerate all functions G.elems → H.elems
  const n = G.elems.length, m = H.elems.length;
  const idxA = (a:A)=> G.elems.findIndex(x=>G.eq(x,a));
  const funcs: number[][] = [];
  const backtrack = (pos=0, acc:number[]=[]): void => {
    if (pos===n) { funcs.push(acc.slice()); return; }
    for (let i=0;i<m;i++) { acc[pos]=i; backtrack(pos+1, acc); }
  };
  backtrack(0, []);

  const homs: GroupHom<A,B>[] = [];
  outer: for (const map of funcs) {
    const f = (a:A)=> H.elems[map[idxA(a)]];
    // hom law
    for (const x of G.elems) for (const y of G.elems) {
      const lhs = f(G.op(x,y));
      const rhs = H.op(f(x), f(y));
      if (!H.eq(lhs, rhs)) continue outer;
    }
    // identity check
    if (!H.eq(f(G.id), H.id)) continue;
    homs.push({ source:G, target:H, f, verify: () => true });
  }
  return homs;
}