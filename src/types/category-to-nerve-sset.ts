// category-to-nerve-sset.ts
// -------------------------------------------------------------------------------------
// Category → Nerve (simplicial set) mini-toolkit
// -------------------------------------------------------------------------------------

// 1) Core small-category primitives ---------------------------------------------------

/** A small category with objects O and morphisms M. */
export interface SmallCategory<O, M> {
  id:  (o: O) => M;                 // identity at o
  src: (m: M) => O;                 // domain of m
  dst: (m: M) => O;                 // codomain of m
  comp:(g: M, f: M) => M;           // g ∘ f, requires dst(f) = src(g)
}

/** Simple arrow for building quivers / free categories. */
export type Edge<O> = { src: O; dst: O; label?: string };

/** A quiver: objects and directed edges between them. */
export interface Quiver<O> {
  readonly objects: ReadonlyArray<O>;
  readonly edges:   ReadonlyArray<Edge<O>>;
}

// 2) Free category on a quiver ---------------------------------------------------------

export type PathMor<O> = {
  readonly src: O;
  readonly dst: O;
  readonly edges: ReadonlyArray<Edge<O>>; // concatenation is composition
};

export function makeFreeCategory<O>(_Q: Quiver<O>): SmallCategory<O, PathMor<O>> & {
  ofEdge: (e: Edge<O>) => PathMor<O>;
} {
  const id = (o: O): PathMor<O> => ({ src: o, dst: o, edges: [] });

  const ofEdge = (e: Edge<O>): PathMor<O> => ({ src: e.src, dst: e.dst, edges: [e] });

  const comp = (g: PathMor<O>, f: PathMor<O>): PathMor<O> => {
    if (f.dst !== g.src) throw new Error(`Cannot compose: dst(f) != src(g)`);
    return { src: f.src, dst: g.dst, edges: [...f.edges, ...g.edges] };
  };

  const src = (m: PathMor<O>) => m.src;
  const dst = (m: PathMor<O>) => m.dst;

  return { id, comp, src, dst, ofEdge };
}

// 3) Functors and natural transformations ---------------------------------------------

export interface CategoryFunctor<C_O, C_M, D_O, D_M> {
  Fobj: (o: C_O) => D_O;
  Fmor: (m: C_M) => D_M; // must preserve identity & composition (not enforced by TS)
}

export interface NatTrans<C_O, D_M> {
  // component at each object x: η_x : F x → G x in D
  eta: (x: C_O) => D_M;
}

export function checkFunctorLaws<C_O, C_M, D_O, D_M>(
  C: SmallCategory<C_O, C_M>,
  D: SmallCategory<D_O, D_M>,
  F: CategoryFunctor<C_O, C_M, D_O, D_M>,
  samples: C_M[]
): { preservesId: boolean; preservesComp: boolean } {
  const preservesId = samples.every(m => {
    const x = C.src(m);
    return D.src(F.Fmor(C.id(x))) === F.Fobj(x) && D.dst(F.Fmor(C.id(x))) === F.Fobj(x);
  });
  const preservesComp = samples.every(m => {
    // try composing with an identity on either side as a lightweight check
    const x = C.src(m);
    const lhs = F.Fmor(C.comp(m, C.id(x))); // m ∘ id_x = m
    const rhs = F.Fmor(m);
    const lhsD = D.comp(F.Fmor(m), F.Fmor(C.id(x))); // F m ∘ F id_x
    return D.src(lhs) === D.src(rhs) && D.dst(lhs) === D.dst(rhs) &&
           D.src(lhsD) === D.src(rhs) && D.dst(lhsD) === D.dst(rhs);
  });
  return { preservesId, preservesComp };
}

export function checkNaturality<C_O, C_M, D_O, D_M>(
  C: SmallCategory<C_O, C_M>,
  D: SmallCategory<D_O, D_M>,
  F: CategoryFunctor<C_O, C_M, D_O, D_M>,
  G: CategoryFunctor<C_O, C_M, D_O, D_M>,
  eta: NatTrans<C_O, D_M>,
  samples: C_M[]
): boolean {
  // For each m: x→y, G(m) ∘ η_x = η_y ∘ F(m)
  return samples.every(m => {
    const x = C.src(m), y = C.dst(m);
    const left  = D.comp(G.Fmor(m), eta.eta(x));
    const right = D.comp(eta.eta(y), F.Fmor(m));
    return D.src(left) === D.src(right) && D.dst(left) === D.dst(right);
  });
}

// 4) Simplicial sets (combinatorial) ---------------------------------------------------

/** n-simplex in the nerve: a composable chain of length n (n≥0). */
export type NSimplex<O, M> = { head: O; chain: ReadonlyArray<M> }; // chain length = n

export interface SimplicialSet<O, M> {
  // constructors / inspectors
  vertex: (o: O) => NSimplex<O, M>;                         // 0-simplex
  simplex: (head: O, chain: ReadonlyArray<M>) => NSimplex<O, M>; // build with validation
  dim: (s: NSimplex<O, M>) => number;                      // n
  objectsOf: (s: NSimplex<O, M>) => O[];                   // x0..xn

  // face/degeneracy maps
  d: (i: number, s: NSimplex<O, M>) => NSimplex<O, M>;     // 0 ≤ i ≤ n
  s: (i: number, s: NSimplex<O, M>) => NSimplex<O, M>;     // 0 ≤ i ≤ n
}

// 5) Nerve construction ----------------------------------------------------------------

export function Nerve<O, M>(C: SmallCategory<O, M>): SimplicialSet<O, M> {
  const vertex = (o: O): NSimplex<O, M> => ({ head: o, chain: [] });

  const isComposableChain = (chain: ReadonlyArray<M>): boolean =>
    chain.every((m, i) => i === 0 || C.dst(chain[i - 1]!) === C.src(m));

  const simplex = (head: O, chain: ReadonlyArray<M>): NSimplex<O, M> => {
    if (chain.length === 0) return vertex(head);
    if (C.src(chain[0]!) !== head) {
      throw new Error(`simplex: head must equal src of first morphism`);
    }
    if (!isComposableChain(chain)) {
      throw new Error(`simplex: chain must be composable`);
    }
    return { head, chain: [...chain] };
  };

  const dim = (s: NSimplex<O, M>) => s.chain.length;

  const objectsOf = (s: NSimplex<O, M>): O[] => {
    const objs: O[] = [s.head];
    s.chain.forEach(m => objs.push(C.dst(m)));
    return objs;
  };

  const d = (i: number, s: NSimplex<O, M>): NSimplex<O, M> => {
    const n = dim(s);
    if (i < 0 || i > n) throw new Error(`d: i out of range 0..${n}`);
    if (n === 0) throw new Error(`d: no faces for 0-simplex`);
    if (i === 0) {
      // drop first arrow; new head is x1
      const newHead = C.dst(s.chain[0]!);
      return { head: newHead, chain: s.chain.slice(1) };
    }
    if (i === n) {
      // drop last arrow; head unchanged
      return { head: s.head, chain: s.chain.slice(0, n - 1) };
    }
    // compose fi+1 ∘ fi at position i-1
    const before = s.chain.slice(0, i - 1);
    const mid = C.comp(s.chain[i]!, s.chain[i - 1]!);
    const after = s.chain.slice(i + 1);
    return { head: s.head, chain: [...before, mid, ...after] };
  };

  const sdeg = (i: number, s: NSimplex<O, M>): NSimplex<O, M> => {
    const n = dim(s);
    if (i < 0 || i > n) throw new Error(`s: i out of range 0..${n}`);
    // insert an identity at position i (at object x_i)
    const objs = objectsOf(s);
    const xi = objs[i]!;
    const idXi = C.id(xi);
    const before = s.chain.slice(0, i);
    const after = s.chain.slice(i);
    return { head: s.head, chain: [...before, idXi, ...after] };
  };

  return { vertex, simplex, dim, objectsOf, d, s: sdeg };
}

// 6) Nerve functor on functors ----------------------------------------------------------

export function mapNerve<C_O, C_M, D_O, D_M>(
  C: SmallCategory<C_O, C_M>,
  D: SmallCategory<D_O, D_M>,
  F: CategoryFunctor<C_O, C_M, D_O, D_M>
) {
  const NC = Nerve(C);
  const ND = Nerve(D);
  return {
    on0: (o: C_O) => ND.vertex(F.Fobj(o)),
    onN: (s: NSimplex<C_O, C_M>): NSimplex<D_O, D_M> => {
      const objs = NC.objectsOf(s);
      const headD = F.Fobj(objs[0]!);
      const chainD = s.chain.map(F.Fmor);
      return ND.simplex(headD, chainD);
    }
  };
}

// 7) Tiny worked example ----------------------------------------------------------------

// Define a quiver A → B → C with an extra direct arrow A → C
export type Obj = 'A' | 'B' | 'C';
const objects: Obj[] = ['A', 'B', 'C'];
const f: Edge<Obj> = { src: 'A', dst: 'B', label: 'f' };
const g: Edge<Obj> = { src: 'B', dst: 'C', label: 'g' };
const h: Edge<Obj> = { src: 'A', dst: 'C', label: 'h' };

export const Q_ABC: Quiver<Obj> = { objects, edges: [f, g, h] };
export const C_free = makeFreeCategory(Q_ABC);

// Build some generating morphisms in the free category
export const f1 = C_free.ofEdge(f); // A→B
export const g1 = C_free.ofEdge(g); // B→C
export const h1 = C_free.ofEdge(h); // A→C

// The nerve of the free category
export const N_free = Nerve(C_free);

// A 2-simplex (f, g): A→B→C
export const sigma2 = N_free.simplex('A', [f1, g1]);

// Its faces: d0 drops f, d1 composes g∘f, d2 drops g
export const d0 = N_free.d(0, sigma2); // head B, chain [g]
export const d1 = N_free.d(1, sigma2); // head A, chain [g∘f]
export const d2 = N_free.d(2, sigma2); // head A, chain [f]

// A degeneracy: insert id at position 1 (at object B)
export const s1 = N_free.s(1, sigma2);

// Helpers for display / debugging -------------------------------------------------------
export function showPath<O>(p: PathMor<O>): string {
  if (p.edges.length === 0) return `${String(p.src)} =id=> ${String(p.dst)}`;
  const segs = p.edges.map(e => `${String(e.src)}→${String(e.dst)}${e.label ? `(${e.label})` : ''}`);
  return segs.join(' ∘ ');
}

export function showSimplex<O>(_C: SmallCategory<O, PathMor<O>>, s: NSimplex<O, PathMor<O>>): string {
  const n = s.chain.length;
  if (n === 0) return `⟨${String(s.head)}⟩`;
  return `[${s.chain.map(showPath).join(' , ')}]`;
}

// 8) Convenience utilities: simplex concatenation & 1-simplex composition ----------------
export function concatSimplex<O, M>(
  C: SmallCategory<O, M>,
  a: NSimplex<O, M>,
  b: NSimplex<O, M>
): NSimplex<O, M> {
  const endA = a.chain.length === 0 ? a.head : C.dst(a.chain[a.chain.length - 1]!);
  if (endA !== b.head) throw new Error(`concatSimplex: end(a) must equal head(b)`);
  return { head: a.head, chain: [...a.chain, ...b.chain] };
}

/** Compose two composable 1-simplices (morphisms) into a single 1-simplex via C.comp. */
export function compose1From1<O, M>(
  C: SmallCategory<O, M>,
  m1: M, // x→y
  m2: M  // y→z
): NSimplex<O, M> {
  if (C.dst(m1) !== C.src(m2)) throw new Error(`compose1From1: morphisms not composable`);
  const comp = C.comp(m2, m1); // m2 ∘ m1 : x→z
  const head = C.src(m1);
  return { head, chain: [comp] };
}

/** Given a 2-simplex ⟨x0; m1: x0→x1, m2: x1→x2⟩, return its composed 1-simplex d1. */
export function compose1From2<O, M>(
  C: SmallCategory<O, M>,
  s: NSimplex<O, M>
): NSimplex<O, M> {
  if (s.chain.length !== 2) throw new Error(`compose1From2: expected a 2-simplex`);
  const comp = C.comp(s.chain[1]!, s.chain[0]!);
  return { head: s.head, chain: [comp] };
}

// 9) Pushout of quivers along a span Q0 → Q1 and Q0 → Q2 --------------------------------
export interface QuiverMorphism<O> {
  readonly source: Quiver<O>;
  readonly target: Quiver<O>;
  onObj: (o: O) => O;         // must send objects to objects of target
  onEdge: (e: Edge<O>) => Edge<O>; // must preserve src/dst under onObj (not checked here)
}

class UnionFind {
  private parent = new Map<string, string>();
  constructor(keys: Iterable<string>) { for (const k of keys) this.parent.set(k, k); }
  find(x: string): string { const p = this.parent.get(x)!; if (p === x) return x; const r = this.find(p); this.parent.set(x, r); return r; }
  union(a: string, b: string) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.parent.set(ra, rb); }
  reps(): Map<string, string[]> { const m = new Map<string, string[]>(); for (const k of this.parent.keys()) { const r = this.find(k); const arr = m.get(r) || []; arr.push(k); m.set(r, arr);} return m; }
}

/** Compute the pushout quiver Q1 ⨿_{Q0} Q2 (finite, labeled-edges variant).
 *  Requires a stable key for objects; optional edge key for dedup.
 */
export function pushoutQuiver<O>(
  f: QuiverMorphism<O>,   // Q0 → Q1
  g: QuiverMorphism<O>,   // Q0 → Q2
  objKey: (o: O) => string,
  edgeKey: (e: Edge<O>) => string = (e) => `${objKey(e.src)}→${objKey(e.dst)}|${e.label ?? ''}`
): Quiver<O> {
  // Collect object keys from both targets
  const k1 = f.target.objects.map(objKey);
  const k2 = g.target.objects.map(objKey);
  const uf = new UnionFind([...k1, ...k2]);

  // Identify images of Q0 objects: f(o) ~ g(o)
  for (const o0 of f.source.objects) {
    uf.union(objKey(f.onObj(o0)), objKey(g.onObj(o0)));
  }

  // Representative object for each class (prefer Q1's representative if available)
  const byKey = new Map<string, O>();
  for (const o of f.target.objects) byKey.set(objKey(o), o);
  for (const o of g.target.objects) if (!byKey.has(objKey(o))) byKey.set(objKey(o), o);

  const repObj = new Map<string, O>();
  for (const [rep, members] of uf.reps()) {
    // Pick the first member we saw from byKey as the chosen object
    const chosen = byKey.get(members.find(m => byKey.has(m))!);
    if (chosen === undefined) throw new Error(`pushoutQuiver: missing representative object`);
    repObj.set(rep, chosen);
  }

  const remapObj = (o: O): O => repObj.get(uf.find(objKey(o)))!;
  const remapEdge = (e: Edge<O>): Edge<O> => ({ 
    src: remapObj(e.src), 
    dst: remapObj(e.dst), 
    ...(e.label !== undefined && { label: e.label })
  });

  // Build edge set from both targets, remapped; coequalize images of Q0 edges by deduping
  const edgeMap = new Map<string, Edge<O>>();
  const addEdge = (e: Edge<O>) => { const re = remapEdge(e); edgeMap.set(edgeKey(re), re); };

  f.target.edges.forEach(addEdge);
  g.target.edges.forEach(addEdge);
  // images of Q0 edges (optional: usually already included if f/g are inclusions)
  for (const e0 of f.source.edges) {
    addEdge(f.onEdge(e0));
    addEdge(g.onEdge(e0));
  }

  const objects: O[] = [...repObj.values()];
  const edges: Edge<O>[] = [...edgeMap.values()];
  return { objects, edges };
}

// Example pushout: glue B of Q1: (A→B) with B of Q2: (B→C) along the common object B
export const Q1: Quiver<Obj> = { objects: ['A', 'B'], edges: [f] };
export const Q2: Quiver<Obj> = { objects: ['B', 'C'], edges: [g] };
export const Q0: Quiver<Obj> = { objects: ['B'], edges: [] };

export const i1: QuiverMorphism<Obj> = {
  source: Q0, target: Q1,
  onObj: (o) => o, // B→B
  onEdge: (e) => e
};
export const i2: QuiverMorphism<Obj> = {
  source: Q0, target: Q2,
  onObj: (o) => o, // B→B
  onEdge: (e) => e
};

export const PO_Q = pushoutQuiver(i1, i2, (o) => o);
// PO_Q.objects = ['A','B','C']; PO_Q.edges ~ [A→B, B→C]
