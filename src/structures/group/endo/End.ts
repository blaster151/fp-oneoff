import { FiniteGroup } from "../Group";
import { GroupHom as BaseGroupHom } from "../GrpCat";

// Extended GroupHom interface with source and target for compatibility
interface GroupHom<A, B> extends BaseGroupHom<A, B> {
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
}

/** Enumerate ALL homomorphisms G→G (small finite G). */
export function enumerateEndomorphisms<A>(G: FiniteGroup<A>, maxSize=9): GroupHom<A,A>[] {
  if (G.elems.length > maxSize) throw new Error("End: group too large for brute force.");
  // Assign images of generators would be faster, but we brute-force all maps from elems to elems.
  const n = G.elems.length;
  const maps: number[][] = [];
  const backtrack = (pos=0, acc:number[]=[]): void => {
    if (pos===n) { maps.push(acc.slice()); return; }
    for (let i=0;i<n;i++) { acc[pos]=i; backtrack(pos+1, acc); }
  };
  backtrack(0, []);
  const idx = (a:A)=> G.elems.findIndex(x=>G.eq(x,a));

  const endos: GroupHom<A,A>[] = [];
  outer: for (const m of maps) {
    const f = (a:A)=> G.elems[m[idx(a)]];
    // hom check
    for (const x of G.elems) for (const y of G.elems) {
      const lhs = f(G.op(x,y));
      const rhs = G.op(f(x), f(y));
      if (!G.eq(lhs, rhs)) continue outer;
    }
    endos.push({ source:G, target:G, f, verify: () => true });
  }
  return endos;
}

/** Monoid structure on End(G) under composition. */
export function endMonoid<A>(G: FiniteGroup<A>) {
  const elems = enumerateEndomorphisms(G);
  const eq = (f:GroupHom<A,A>, g:GroupHom<A,A>) =>
    G.elems.every(a => G.eq(f.f(a), g.f(a)));
  const op = (f:GroupHom<A,A>, g:GroupHom<A,A>) =>
    ({ source:G, target:G, f:(a:A)=> g.f(f.f(a)), verify: () => true });
  const e = { source:G, target:G, f:(a:A)=>a, verify: () => true };
  const inv = (_:GroupHom<A,A>) => { throw new Error("End(G) is a monoid (no inv in general)"); };
  return { elems, eq, op, e, inv };
}

/** Units(End(G)) ≅ Aut(G): those endomorphisms that are bijective. */
export function unitsAsAutos<A>(G: FiniteGroup<A>): GroupHom<A,A>[] {
  const E = enumerateEndomorphisms(G);
  const auto: GroupHom<A,A>[] = [];
  for (const f of E) {
    // bijection test
    const seen: A[] = [];
    let ok = true;
    for (const a of G.elems) {
      const b = f.f(a);
      if (seen.some(s=>G.eq(s,b))) { ok=false; break; }
      seen.push(b);
    }
    if (ok && seen.length===G.elems.length) auto.push(f);
  }
  return auto;
}