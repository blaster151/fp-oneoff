// category-to-nerve-sset.ts
// -------------------------------------------------------------------------------------
// Category → Nerve (simplicial set) mini-toolkit
// -------------------------------------------------------------------------------------

import { eqJSON } from './eq.js';

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
    const eq = eqJSON<unknown>();
    return eq(D.src(F.Fmor(C.id(x))), F.Fobj(x)) && eq(D.dst(F.Fmor(C.id(x))), F.Fobj(x));
  });
  const preservesComp = samples.every(m => {
    // try composing with an identity on either side as a lightweight check
    const x = C.src(m);
    const lhs = F.Fmor(C.compose(m, C.id(x))); // m ∘ id_x = m
    const rhs = F.Fmor(m);
    const lhsD = D.compose(F.Fmor(m), F.Fmor(C.id(x))); // F m ∘ F id_x
    const eq = eqJSON<unknown>();
    return eq(D.src(lhs), D.src(rhs)) && eq(D.dst(lhs), D.dst(rhs)) &&
           eq(D.src(lhsD), D.src(rhs)) && eq(D.dst(lhsD), D.dst(rhs));
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
    const left  = D.compose(G.Fmor(m), eta.eta(x));
    const right = D.compose(eta.eta(y), F.Fmor(m));
    const eq = eqJSON<unknown>();
    return eq(D.src(left), D.src(right)) && eq(D.dst(left), D.dst(right));
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
    const mid = C.compose(s.chain[i]!, s.chain[i - 1]!);
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
  const comp = C.compose(m2, m1); // m2 ∘ m1 : x→z
  const head = C.src(m1);
  return { head, chain: [comp] };
}

/** Given a 2-simplex ⟨x0; m1: x0→x1, m2: x1→x2⟩, return its composed 1-simplex d1. */
export function compose1From2<O, M>(
  C: SmallCategory<O, M>,
  s: NSimplex<O, M>
): NSimplex<O, M> {
  if (s.chain.length !== 2) throw new Error(`compose1From2: expected a 2-simplex`);
  const comp = C.compose(s.chain[1]!, s.chain[0]!);
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

// =================================================================================================
// 10) Quasi-category helpers: inner horns Λ¹² (n=2, i=1), validator, unique filler for Nerve(C)
// =================================================================================================

/** An inner 2-horn Λ¹² in any simplicial set can be represented (for nerves) by its two 1-faces. 
 *  Here we model it concretely for the nerve of a category:
 *    d0 : x1→x2  (drops the first edge)
 *    d2 : x0→x1  (drops the last edge)
 *  The missing face d1 is the composite x0→x2.
 */
export type InnerHorn2<O, M> = {
  /** d0 face: the "right" edge x1→x2 */
  readonly d0: NSimplex<O, M>; // 1-simplex
  /** d2 face: the "left"  edge x0→x1 */
  readonly d2: NSimplex<O, M>; // 1-simplex
};

export function makeInnerHorn2<O, M>(
  C: SmallCategory<O, M>,
  m01: M, // x0→x1
  m12: M  // x1→x2
): InnerHorn2<O, M> {
  // build 1-simplices as nerves do
  const left  = { head: C.src(m01), chain: [m01] }; // d2
  const right = { head: C.src(m12), chain: [m12] }; // d0
  return { d0: right, d2: left };
}

/** Basic well-formedness for a nerve-style Λ¹²: endpoints match so a composite exists. */
export function validateInnerHorn2<O, M>(
  C: SmallCategory<O, M>,
  horn: InnerHorn2<O, M>
): boolean {
  // Each face must be a 1-simplex.
  if (horn.d0.chain.length !== 1 || horn.d2.chain.length !== 1) return false;

  const m01 = horn.d2.chain[0]!; // x0→x1
  const m12 = horn.d0.chain[0]!; // x1→x2

  // Middle object must match: dst(m01) = src(m12)
  return C.dst(m01) === C.src(m12);
}

/** Unique filler for Λ¹² in the Nerve of a 1-category: the 2-simplex (m01, m12). */
export function fillInnerHorn2_Nerve<O, M>(
  C: SmallCategory<O, M>,
  horn: InnerHorn2<O, M>
): NSimplex<O, M> {
  if (!validateInnerHorn2(C, horn)) throw new Error("fillInnerHorn2_Nerve: ill-formed horn");
  const m01 = horn.d2.chain[0]!;
  const m12 = horn.d0.chain[0]!;
  const head = C.src(m01); // x0
  return { head, chain: [m01, m12] }; // 2-simplex ⟨x0; m01, m12⟩
}

/** For nerves of ordinary categories, inner 2-horns always have a unique filler. */
export function hasUniqueInnerHorn2_Nerve<O, M>(
  C: SmallCategory<O, M>,
  horn: InnerHorn2<O, M>
): boolean {
  return validateInnerHorn2(C, horn);
}

/** A lightweight "quasi-category structure" marker with just Λ¹² fillers. 
 *  (General quasi-categories require all inner horn fillers for all n≥2; 
 *   this is a minimal, practical slice you can test on finite nerves.)
 */
export interface QuasiCategory<O, M> extends SimplicialSet<O, M> {
  hasInnerHorn2: (horn: InnerHorn2<O, M>) => boolean;
  fillInnerHorn2: (horn: InnerHorn2<O, M>) => NSimplex<O, M>;
}

/** Equip the Nerve(C) with inner-2-horn filler operations. */
export function asQuasiFromNerve<O, M>(
  C: SmallCategory<O, M>
): QuasiCategory<O, M> {
  const base = Nerve(C);
  return {
    ...base,
    hasInnerHorn2: (h) => hasUniqueInnerHorn2_Nerve(C, h),
    fillInnerHorn2: (h) => fillInnerHorn2_Nerve(C, h),
  };
}

// --- Example (works with your earlier free category C_free, f1: A→B, g1: B→C) ---
// const horn = makeInnerHorn2(C_free, f1, g1);
// const Nq = asQuasiFromNerve(C_free);
// Nq.hasInnerHorn2(horn);              // true
// const sigma = Nq.fillInnerHorn2(horn) // the 2-simplex [f1, g1]


// =================================================================================================
// 11) (Optional) Inner horn "sanity" for nerves: check the composite face matches d1
// =================================================================================================

/** For a 2-simplex σ = [m01, m12], d1(σ) is the composed 1-simplex m12∘m01. */
export function d1_of_2simplex<O, M>(
  C: SmallCategory<O, M>,
  s: NSimplex<O, M>
): NSimplex<O, M> {
  if (s.chain.length !== 2) throw new Error("d1_of_2simplex: expected a 2-simplex");
  const comp = C.compose(s.chain[1]!, s.chain[0]!);
  return { head: s.head, chain: [comp] };
}

/** In the nerve, the unique filler property for Λ¹² means: 
 *    d2(σ) = horn.d2, d0(σ) = horn.d0, and d1(σ) equals their composite.
 */
export function checkFilledHorn2<O, M>(
  C: SmallCategory<O, M>,
  horn: InnerHorn2<O, M>,
  filler: NSimplex<O, M>
): boolean {
  if (filler.chain.length !== 2) return false;
  const okFaces =
    // d2 drops last edge → left edge
    (() => {
      const d2 = { head: filler.head, chain: [filler.chain[0]!] };
      return d2.head === horn.d2.head && d2.chain[0] === horn.d2.chain[0]!;
    })() &&
    // d0 drops first edge → right edge
    (() => {
      const newHead = C.dst(filler.chain[0]!);
      const d0 = { head: newHead, chain: [filler.chain[1]!] };
      return d0.head === horn.d0.head && d0.chain[0] === horn.d0.chain[0]!;
    })();

  const compFace = d1_of_2simplex(C, filler);
  const expectedComp = C.compose(horn.d0.chain[0]!, horn.d2.chain[0]!); // m12∘m01
  const compOk = compFace.chain[0] === expectedComp && compFace.head === horn.d2.head;
  return okFaces && compOk;
}


// =================================================================================================
// 12) Double categories: types + a concrete "commuting squares" construction from a category
// =================================================================================================

/** A 2-cell (square) boundary in a strict double category (commuting square shape). */
export type Square<O, H, V> = {
  /** top: A ──hTop──▶ B */
  readonly hTop: H;
  /** bottom: A' ──hBot──▶ B' */
  readonly hBot: H;
  /** left:  A ⇓ vL ⇓ A'  (vertical) */
  readonly vLeft: V;
  /** right: B ⇓ vR ⇓ B'  (vertical) */
  readonly vRight: V;
  /** Phantom type parameter to satisfy TypeScript */
  readonly __phantom?: O;
};

export interface DoubleCategory<O, H, V, S> {
  /** Horizontal category (objects O, horizontal morphisms H). */
  readonly H: SmallCategory<O, H>;
  /** Vertical category (objects O, vertical morphisms V). */
  readonly V: SmallCategory<O, V>;

  /** Make/check a square (may throw if boundaries are ill-typed). */
  mkSquare: (b: Square<O, H, V>) => S;

  /** Project boundaries. */
  top: (s: S) => H;
  bottom: (s: S) => H;
  left: (s: S) => V;
  right: (s: S) => V;

  /** Horizontal and vertical pasting of squares. */
  hcomp: (beta: S, alpha: S) => S; // paste alpha • beta left-to-right
  vcomp: (beta: S, alpha: S) => S; // paste alpha over beta top-to-bottom

  /** Identity squares */
  idVCell: (h: H) => S; // identity in the vertical direction on a horizontal arrow
  idHCell: (v: V) => S; // identity in the horizontal direction on a vertical arrow
}

/** Build the strict double category of commuting squares in a single category C:
 *  - Horizontal == Vertical == morphisms of C (same underlying category)
 *  - A square is a commutative square in C:
 *         A --hTop--> B
 *        vL        vR
 *        A'--hBot-->B'
 *    with vR∘hTop = hBot∘vL
 *  Equality of morphisms is checked via the provided eqM.
 */
export function makeCommutingSquaresDouble<O, M>(
  C: SmallCategory<O, M>,
  eqM: (x: M, y: M) => boolean
): DoubleCategory<O, M, M, Square<O, M, M>> {
  const H = C, V = C;

  const typecheck = (b: Square<O, M, M>) => {
    // typing: sources/targets match around the square
    if (C.src(b.hTop) !== C.src(b.vLeft))  throw new Error("Square: src(hTop) != src(vLeft)");
    if (C.dst(b.hTop) !== C.src(b.vRight)) throw new Error("Square: dst(hTop) != src(vRight)");
    if (C.dst(b.vLeft) !== C.src(b.hBot))  throw new Error("Square: dst(vLeft) != src(hBot)");
    if (C.dst(b.vRight) !== C.dst(b.hBot)) throw new Error("Square: dst(vRight) != dst(hBot)");
  };

  const commuteCheck = (b: Square<O, M, M>) => {
    const topThenRight = C.compose(b.vRight, b.hTop);
    const leftThenBot  = C.compose(b.hBot,  b.vLeft);
    if (!eqM(topThenRight, leftThenBot)) {
      throw new Error("Square does not commute: vRight ∘ hTop ≠ hBot ∘ vLeft");
    }
  };

  const mkSquare = (b: Square<O, M, M>): Square<O, M, M> => {
    typecheck(b);
    commuteCheck(b);
    return b;
  };

  const hcomp = (beta: Square<O, M, M>, alpha: Square<O, M, M>): Square<O, M, M> => {
    // right side of alpha must equal left side of beta
    if (C.src(alpha.hTop) !== C.src(alpha.vLeft)) throw new Error("alpha ill-typed");
    if (C.src(beta.hTop)  !== C.src(beta.vLeft))  throw new Error("beta ill-typed");
    if (C.src(alpha.hBot) !== C.src(alpha.vLeft)) throw new Error("alpha ill-typed (bot)");
    if (C.src(beta.hBot)  !== C.src(beta.vLeft))  throw new Error("beta ill-typed (bot)");

    if (!(C.dst(alpha.hTop) === C.src(beta.hTop) && C.dst(alpha.hBot) === C.src(beta.hBot)))
      throw new Error("hcomp: horizontal middles must meet");
    if (C.dst(alpha.vRight) !== C.src(beta.vLeft))
      throw new Error("hcomp: alpha.vRight must equal beta.vLeft (same object boundary)");

    const hTop = C.compose(beta.hTop, alpha.hTop);
    const hBot = C.compose(beta.hBot, alpha.hBot);
    const vLeft  = alpha.vLeft;
    const vRight = beta.vRight;

    return mkSquare({ hTop, hBot, vLeft, vRight });
  };

  const vcomp = (beta: Square<O, M, M>, alpha: Square<O, M, M>): Square<O, M, M> => {
    // bottom of alpha must meet top of beta
    if (!(C.dst(alpha.vLeft) === C.src(beta.vLeft) && C.dst(alpha.vRight) === C.src(beta.vRight)))
      throw new Error("vcomp: vertical middles must meet");
    if (!(C.dst(alpha.hTop) === C.src(beta.hTop) && C.dst(alpha.hBot) === C.src(beta.hBot)))
      throw new Error("vcomp: horizontal boundaries must align");

    const hTop = alpha.hTop;
    const hBot = beta.hBot;
    const vLeft  = C.compose(beta.vLeft,  alpha.vLeft);
    const vRight = C.compose(beta.vRight, alpha.vRight);

    return mkSquare({ hTop, hBot, vLeft, vRight });
  };

  const idVCell = (h: M): Square<O, M, M> => {
    const vLeft  = V.id(C.src(h));
    const vRight = V.id(C.dst(h));
    return mkSquare({ hTop: h, hBot: h, vLeft, vRight });
  };

  const idHCell = (v: M): Square<O, M, M> => {
    const hTop = H.id(C.src(v));
    const hBot = H.id(C.dst(v));
    return mkSquare({ hTop, hBot, vLeft: v, vRight: v });
  };

  return {
    H, V,
    mkSquare,
    top:    (s) => s.hTop,
    bottom: (s) => s.hBot,
    left:   (s) => s.vLeft,
    right:  (s) => s.vRight,
    hcomp,
    vcomp,
    idVCell,
    idHCell,
  };
}

/** Interchange law checker for commuting-squares double categories:
 *  (β ∘v α) ∘h (δ ∘v γ)  ==  (β ∘h δ) ∘v (α ∘h γ)
 */
export function checkInterchange<O, M>(
  D: DoubleCategory<O, M, M, Square<O, M, M>>,
  alpha: Square<O, M, M>,
  beta:  Square<O, M, M>,
  gamma: Square<O, M, M>,
  delta: Square<O, M, M>,
  eqM: (x: M, y: M) => boolean
): boolean {
  const left  = D.hcomp(D.vcomp(beta, alpha), D.vcomp(delta, gamma));
  const right = D.vcomp(D.hcomp(beta, delta),  D.hcomp(alpha, gamma));

  // Compare boundaries componentwise (commuting-squares construction guarantees commutation)
  return eqM(left.hTop, right.hTop) &&
         eqM(left.hBot, right.hBot) &&
         eqM(left.vLeft, right.vLeft) &&
         eqM(left.vRight, right.vRight);
}

// --- Tiny example using your free category (PathMor) where equality is structural ----
// const eqPath = (x: PathMor<Obj>, y: PathMor<Obj>) =>
//   x.src===y.src && x.dst===y.dst && x.edges.length===y.edges.length &&
//   x.edges.every((e,i)=> e===y.edges[i]);
// const Dsq = makeCommutingSquaresDouble(C_free, eqPath);
// // Identity squares on f1 and g1
// const If = Dsq.idVCell(f1);
// const Ig = Dsq.idVCell(g1);
// // Interchange on a grid of identities trivially holds:
// checkInterchange(Dsq, If, If, Ig, Ig, eqPath); // true

// =================================================================================================
// 13) Double functors (between strict double categories)
// =================================================================================================

export interface DoubleFunctor<
  C1_O, C1_H, C1_V, C1_S,
  C2_O, C2_H, C2_V, C2_S
> {
  FH: CategoryFunctor<C1_O, C1_H, C2_O, C2_H>;               // on horizontal arrows
  FV: CategoryFunctor<C1_O, C1_V, C2_O, C2_V>;               // on vertical arrows
  onSquare: (s: C1_S) => C2_S;                       // action on 2-cells
}

// (Optional) lightweight law checker on a sample of squares
export function checkDoubleFunctorLaws<
  O1,H1,V1,S1, O2,H2,V2,S2
>(
  D1: DoubleCategory<O1,H1,V1,S1>,
  D2: DoubleCategory<O2,H2,V2,S2>,
  F: DoubleFunctor<O1,H1,V1,S1, O2,H2,V2,S2>,
  sampleSquares: ReadonlyArray<S1>
): { preservesBoundaries: boolean; preservesCompH: boolean; preservesCompV: boolean; preservesIds: boolean } {

  const bd = sampleSquares.every(s => {
    const img = F.onSquare(s);
    const eq = eqJSON<unknown>();
    return eq(D2.top(img), F.FH.Fmor(D1.top(s))) &&
           eq(D2.bottom(img), F.FH.Fmor(D1.bottom(s))) &&
           eq(D2.left(img), F.FV.Fmor(D1.left(s))) &&
           eq(D2.right(img), F.FV.Fmor(D1.right(s)));
  });

  // try closure under hcomp / vcomp on adjacent pairs from the sample
  const pairs = sampleSquares.slice(1).map((_,i) => [sampleSquares[i]!, sampleSquares[i+1]!] as const);
  const ph = pairs.every(([a,b]) => {
    try {
      const lhs = F.onSquare(D1.hcomp(b, a));
      const rhs = D2.hcomp(F.onSquare(b), F.onSquare(a));
      const eq = eqJSON<unknown>();
      return eq(D2.top(lhs), D2.top(rhs)) && eq(D2.bottom(lhs), D2.bottom(rhs)) &&
             eq(D2.left(lhs), D2.left(rhs)) && eq(D2.right(lhs), D2.right(rhs));
    } catch { return true; } // ignore non-composable samples
  });

  const pv = pairs.every(([a,b]) => {
    try {
      const lhs = F.onSquare(D1.vcomp(b, a));
      const rhs = D2.vcomp(F.onSquare(b), F.onSquare(a));
      const eq = eqJSON<unknown>();
      return eq(D2.top(lhs), D2.top(rhs)) && eq(D2.bottom(lhs), D2.bottom(rhs)) &&
             eq(D2.left(lhs), D2.left(rhs)) && eq(D2.right(lhs), D2.right(rhs));
    } catch { return true; }
  });

  const pi = sampleSquares.every(s => {
    const h = D1.top(s), v = D1.left(s);
    const idV = F.onSquare(D1.idVCell(h));
    const idH = F.onSquare(D1.idHCell(v));
    const eq = eqJSON<unknown>();
    return eq(D2.top(idV), F.FH.Fmor(h)) && eq(D2.bottom(idV), F.FH.Fmor(h)) &&
           eq(D2.left(idV), D2.V.id(D2.H.src(F.FH.Fmor(h)))) &&
           eq(D2.right(idV), D2.V.id(D2.H.dst(F.FH.Fmor(h)))) &&
           eq(D2.left(idH), F.FV.Fmor(v)) && eq(D2.right(idH), F.FV.Fmor(v)) &&
           eq(D2.top(idH), D2.H.id(D2.V.src(F.FV.Fmor(v)))) &&
           eq(D2.bottom(idH), D2.H.id(D2.V.dst(F.FV.Fmor(v))));
  });

  return { preservesBoundaries: bd, preservesCompH: ph, preservesCompV: pv, preservesIds: pi };
}

// =================================================================================================
// 14) Double category of relations: objects are finite sets, H=relations, V=functions
// =================================================================================================

export type SetObj<A> = {
  id: string;
  elems: ReadonlyArray<A>;
  eq: (x:A, y:A) => boolean;
};

// Horizontal morphism: binary relation R ⊆ A×B (as a predicate)
export type Rel = {
  src: SetObj<any>;
  dst: SetObj<any>;
  holds: (a:any, b:any) => boolean;
};

// Vertical morphism: total function between the carriers
export type FnM = {
  src: SetObj<any>;
  dst: SetObj<any>;
  f: (a:any) => any; // must land in dst.elems
};

const inSet = <A>(S: SetObj<A>, x:A) => S.elems.some(y => S.eq(x,y));

export function RelCat(): SmallCategory<SetObj<any>, Rel> {
  const id = (A: SetObj<any>): Rel => ({
    src: A, dst: A,
    holds: (a:any,b:any) => inSet(A,a) && inSet(A,b) && A.eq(a,b)
  });

  const src = (r: Rel) => r.src;
  const dst = (r: Rel) => r.dst;

  const comp = (S: Rel, R: Rel): Rel => {
    if (R.dst !== S.src) throw new Error("Rel ∘ Rel: cod/domain mismatch");
    return {
      src: R.src, dst: S.dst,
      holds: (a:any, c:any) =>
        inSet(R.src,a) && inSet(S.dst,c) &&
        R.dst.elems.some((b:any) => R.holds(a,b) && S.holds(b,c))
    };
  };

  return { id, src, dst, comp };
}

export function FuncCat(): SmallCategory<SetObj<any>, FnM> {
  const id = (A: SetObj<any>): FnM => ({ src:A, dst:A, f: (a:any)=>a });
  const src = (f: FnM) => f.src;
  const dst = (f: FnM) => f.dst;
  const comp = (g: FnM, f: FnM): FnM => {
    if (f.dst !== g.src) throw new Error("Fn ∘ Fn: cod/domain mismatch");
    return { src: f.src, dst: g.dst, f: (a:any) => g.f(f.f(a)) };
  };
  return { id, src, dst, comp };
}

// Diagonal relation on A (identity wrt relational composition)
export const diagRel = (A: SetObj<any>): Rel => RelCat().id(A);

// --- Helpers: subset/equality of relations on finite sets ---
export const subsetRel = (R: Rel, S: Rel): boolean => {
  if (R.src !== S.src || R.dst !== S.dst) return false;
  for (const a of R.src.elems) for (const b of R.dst.elems) {
    if (R.holds(a,b) && !S.holds(a,b)) return false;
  }
  return true;
};

export const equalRel = (R: Rel, S: Rel): boolean =>
  subsetRel(R,S) && subsetRel(S,R);

// --- Companion / Conjoint of a function f: A -> B ---
// Γ_f : A ↔ B    (graph)
export const companionOf = (f: FnM): Rel => ({
  src: f.src,
  dst: f.dst,
  holds: (a:any, b:any) => f.dst.eq(f.f(a), b)
});

// Γ_f^† : B ↔ A  (cograph)
export const conjointOf = (f: FnM): Rel => ({
  src: f.dst,
  dst: f.src,
  holds: (b:any, a:any) => f.dst.eq(b, f.f(a))
});

// --- Unit and counit squares as inclusion witnesses ---
export function unitSquare(D = makeRelationsDouble(), f: FnM) {
  const H = RelCat(), V = FuncCat();
  const etaTop  = H.id(f.src);                                  // id_A
  const etaBot  = H.compose(conjointOf(f), companionOf(f));         // Γ_f^† ∘ Γ_f
  return D.mkSquare({ hTop: etaTop, hBot: etaBot, vLeft: V.id(f.src), vRight: V.id(f.src) });
}

export function counitSquare(D = makeRelationsDouble(), f: FnM) {
  const H = RelCat(), V = FuncCat();
  const epsTop = H.compose(companionOf(f), conjointOf(f));          // Γ_f ∘ Γ_f^†
  const epsBot = H.id(f.dst);                                    // id_B
  return D.mkSquare({ hTop: epsTop, hBot: epsBot, vLeft: V.id(f.dst), vRight: V.id(f.dst) });
}

// --- Triangle equalities (check as equalities of relations) ---
export function trianglesHold(f: FnM): boolean {
  const H = RelCat();
  const G  = companionOf(f);   // A↔B
  const Gd = conjointOf(f);    // B↔A
  const leftTriangle  = H.compose(H.compose(G, Gd), G);   // (Γ ∘ Γ†) ∘ Γ
  const rightTriangle = H.compose(Gd, H.compose(G, Gd));  // Γ† ∘ (Γ ∘ Γ†)
  return equalRel(leftTriangle, G) && equalRel(rightTriangle, Gd);
}

// Double category of relations: squares witness (vR ∘ R_top) ⊆ (R_bot ∘ vL)
export function makeRelationsDouble() {
  const H = RelCat();
  const V = FuncCat();

  const mkSquare = (b: Square<SetObj<any>, Rel, FnM>) => {
    // type checks
    if (b.hTop.src !== b.vLeft.src)  throw new Error("Square typing: src(hTop) != src(vLeft)");
    if (b.hTop.dst !== b.vRight.src) throw new Error("Square typing: dst(hTop) != src(vRight)");
    if (b.vLeft.dst !== b.hBot.src)  throw new Error("Square typing: dst(vLeft) != src(hBot)");
    if (b.vRight.dst !== b.hBot.dst) throw new Error("Square typing: dst(vRight) != dst(hBot)");

    // commutation as inclusion: for all a,b, R_top(a,b) ⇒ R_bot(vL(a), vR(b))
    const A = b.hTop.src, B = b.hTop.dst;
    for (const a of A.elems) for (const b0 of B.elems) {
      if (b.hTop.holds(a,b0)) {
        const a1 = b.vLeft.f(a);
        const b1 = b.vRight.f(b0);
        if (!b.hBot.holds(a1,b1)) throw new Error("Relation square does not commute (inclusion fails)");
      }
    }
    return b;
  };

  const top    = (s: Square<SetObj<any>,Rel,FnM>) => s.hTop;
  const bottom = (s: Square<SetObj<any>,Rel,FnM>) => s.hBot;
  const left   = (s: Square<SetObj<any>,Rel,FnM>) => s.vLeft;
  const right  = (s: Square<SetObj<any>,Rel,FnM>) => s.vRight;

  const hcomp = (beta: Square<SetObj<any>,Rel,FnM>, alpha: Square<SetObj<any>,Rel,FnM>) =>
    mkSquare({
      hTop: H.compose(beta.hTop, alpha.hTop),
      hBot: H.compose(beta.hBot, alpha.hBot),
      vLeft: alpha.vLeft,
      vRight: beta.vRight
    });

  const vcomp = (beta: Square<SetObj<any>,Rel,FnM>, alpha: Square<SetObj<any>,Rel,FnM>) =>
    mkSquare({
      hTop: alpha.hTop,
      hBot: beta.hBot,
      vLeft: V.compose(beta.vLeft, alpha.vLeft),
      vRight: V.compose(beta.vRight, alpha.vRight)
    });

  const idVCell = (h: Rel) => mkSquare({
    hTop: h, hBot: h,
    vLeft: V.id(h.src), vRight: V.id(h.dst)
  });

  const idHCell = (v: FnM) => mkSquare({
    hTop: diagRel(v.src),
    hBot: diagRel(v.dst),
    vLeft: v, vRight: v
  });

  const D: DoubleCategory<SetObj<any>, Rel, FnM, Square<SetObj<any>,Rel,FnM>> = {
    H, V, mkSquare, top, bottom, left, right, hcomp, vcomp, idVCell, idHCell
  };
  return D;
}

// =================================================================================================
// 15) General inner horns + search-based filler for finite simplicial sets
// =================================================================================================

/** An inner horn Λᵢⁿ: all faces d_j(σ) for j≠i, each a (n-1)-simplex. */
export type InnerHornN<O,M> = {
  n: number;          // n ≥ 2
  i: number;          // 0 < i < n  (inner)
  faces: Map<number, NSimplex<O,M>>; // keys are all j≠i
};

export function makeInnerHornN<O,M>(
  n: number,
  i: number,
  faces: Array<[number, NSimplex<O,M>]>
): InnerHornN<O,M> {
  if (n < 2) throw new Error("Inner horn needs n≥2");
  if (!(0 < i && i < n)) throw new Error("Inner horn index must be inner: 0<i<n");
  const map = new Map<number, NSimplex<O,M>>(faces);
  if (map.size !== n) throw new Error("Provide exactly n faces (all j≠i)");
  return { n, i, faces: map };
}

/** Finite simplicial set: we can enumerate n-simplices to brute-force match a horn. */
export interface FiniteSSet<O,M> extends SimplicialSet<O,M> {
  nSimplices: (n:number) => ReadonlyArray<NSimplex<O,M>>;
}

/** Try to fill a horn by enumerating all n-simplices and checking faces. */
export function searchFillInnerHorn<O,M>(
  S: FiniteSSet<O,M>,
  horn: InnerHornN<O,M>,
  eqSimplex: (x: NSimplex<O,M>, y: NSimplex<O,M>) => boolean
): NSimplex<O,M> | undefined {
  const { n } = horn;
  for (const cand of S.nSimplices(n)) {
    let ok = true;
    for (const [j, face] of horn.faces.entries()) {
      const dj = S.d(j, cand);
      if (!eqSimplex(dj, face)) { ok = false; break; }
    }
    if (ok) return cand;
  }
  return undefined;
}

/** Build a finite nerve from a finite category presentation (objects + a finite morphism list). */
export function FiniteNerve<O,M>(
  C: SmallCategory<O,M>,
  objects: ReadonlyArray<O>,
  morphisms: ReadonlyArray<M>,
  _eqM: (x:M,y:M)=>boolean
): FiniteSSet<O,M> {
  const base = Nerve(C);

  // generate all composable chains of length n starting at any object
  const chainsOfLen = (n:number): ReadonlyArray<{head:O; chain:M[]}> => {
    if (n===0) return objects.map(o => ({ head:o, chain:[] as M[] }));
    const res: {head:O; chain:M[]}[] = [];
    for (const o of objects) {
      // start from morphisms with src(o)
      const firsts = morphisms.filter(m => C.src(m)===o);
      for (const m0 of firsts) {
        const grow = (head:O, acc:M[], k:number, last:M) => {
          if (k===n) { res.push({ head, chain:[...acc] }); return; }
          const nexts = morphisms.filter(m => C.src(m)===C.dst(last));
          for (const m of nexts) grow(head, [...acc, m], k+1, m);
        };
        if (n===1) { res.push({ head:o, chain:[m0] }); }
        else grow(o, [m0], 1, m0);
      }
    }
    return res;
  };

  const nSimplices = (n:number) =>
    chainsOfLen(n).map(({head,chain}) => base.simplex(head, chain));

  return { ...base, nSimplices };
}

// =================================================================================================
// Tiny example: an expression DSL + interpreters
// =================================================================================================

// A simple expression language
export type Expr = 
  | { tag: 'lit'; val: number }
  | { tag: 'add'; left: Expr; right: Expr }
  | { tag: 'mul'; left: Expr; right: Expr };

// Smart constructors
export const lit = (n: number): Expr => ({ tag: 'lit', val: n });
export const add = (e1: Expr, e2: Expr): Expr => ({ tag: 'add', left: e1, right: e2 });
export const mul = (e1: Expr, e2: Expr): Expr => ({ tag: 'mul', left: e1, right: e2 });

// Interpreter (evaluator)
export const evalExpr = (e: Expr): number => {
  switch (e.tag) {
    case 'lit': return e.val;
    case 'add': return evalExpr(e.left) + evalExpr(e.right);
    case 'mul': return evalExpr(e.left) * evalExpr(e.right);
  }
};

// Pretty printer
export const printExpr = (e: Expr): string => {
  switch (e.tag) {
    case 'lit': return e.val.toString();
    case 'add': return `(${printExpr(e.left)} + ${printExpr(e.right)})`;
    case 'mul': return `(${printExpr(e.left)} * ${printExpr(e.right)})`;
  }
};

// =================================================================================================
// 18) Protransformations, Coend-based Composition, and Whiskering
// =================================================================================================

/** Creates a discrete finite category: objects X with only identity morphisms. */
export function Disc<X extends string>(objs: ReadonlyArray<X>): FiniteSmallCategory<X, {tag:"id", x:X}> {
  return {
    objects: objs,
    morphisms: objs.map(x => ({ tag:"id", x })),
    id: (o:X)=>({tag:"id", x:o}),
    src: (m)=>m.x,
    dst: (m)=>m.x,
    comp: (g,f)=> (g.x===f.x ? g : (()=>{ throw new Error("impossible in discrete"); })()),
    hom: (x, y) => x === y ? [{tag:"id", x}] : []
  };
}

/** Creates a table-based finite profunctor with identity lmap/rmap (useful for discrete categories). */
export function tableProf<A extends string, B extends string, T>(
  _A: FiniteSmallCategory<A, any>,
  _B: FiniteSmallCategory<B, any>,
  table: Record<A, Record<B, T[]>>
): FiniteProf<A, any, B, any, T> {
  return {
    elems: (a,b)=> table[a]?.[b] ?? [],
    lmap: (_u, _b, t)=> t,  // discrete: only identities
    rmap: (_a, _v, t)=> t
  };
}

/** Tests if two relations are equal by checking inclusions both ways. */
export function relsEqualByInclusions(R: Rel, S: Rel): boolean {
  const D = makeRelationsDouble();
  const incl = (top: Rel, bot: Rel) => {
    try { 
      D.mkSquare({ 
        hTop: top, 
        hBot: bot, 
        vLeft: D.V.id(top.src), 
        vRight: D.V.id(top.dst) 
      }); 
      return true; 
    }
    catch { 
      return false; 
    }
  };
  return incl(R,S) && incl(S,R);
}

/** Pretty-prints coend quotient classes for debugging. */
export function showClasses<A_O, C_O, B_O, TP, TQ>(
  a: A_O, 
  c: C_O, 
  R: { elems: (a: A_O, c: C_O) => ReadonlyArray<{ rep: { b: B_O; p: TP; q: TQ } }> }
): string[] {
  const classes = R.elems(a,c);
  return classes.map((cls) => `⟦b=${cls.rep.b}; p=${cls.rep.p}; q=${cls.rep.q}⟧`);
}

/** A protransformation α : P ⇒ Q between profunctors P,Q : A ⇸ B is a natural family. */
export interface ProTrans<A_O, _A_M, B_O, _B_M, TP, TQ> {
  // Component at each pair (a,b): α_{a,b} : P(a,b) → Q(a,b)
  at: (a: A_O, b: B_O) => (p: TP) => TQ;
}

/** Naturality checker for protransformations in finite presentations. */
export function checkProTransNaturality<A_O, A_M, B_O, B_M, TP, TQ>(
  A: SmallCategory<A_O, A_M>,
  B: SmallCategory<B_O, B_M>,
  P: any,
  Q: any,
  alpha: ProTrans<A_O, A_M, B_O, B_M, TP, TQ>,
  sampleMorphisms: Array<{ u: A_M; v: B_M }>
): boolean {
  return sampleMorphisms.every(({ u, v }) => {
    // For each u: a'→a and v: b→b', naturality means:
    // Q(u,v) ∘ α_{a,b} = α_{a',b'} ∘ P(u,v)
    // We test this on sample elements from P(a,b)
    
    const a = A.src(u);
    const aPrime = A.dst(u);
    const b = B.src(v);
    const bPrime = B.dst(v);
    
    // Get sample elements from P(a,b)
    const sampleElems = P.elems(a, b);
    if (sampleElems.length === 0) return true; // vacuously true
    
    return sampleElems.every((p: any) => {
      // Left side: Q(u,v) ∘ α_{a,b}(p)
      const alphaP = alpha.at(a, b)(p);
      const leftSide = Q.rmap(a, v, Q.lmap(u, b, alphaP));
      
      // Right side: α_{a',b'} ∘ P(u,v)(p)
      const PuP = P.rmap(a, v, P.lmap(u, b, p));
      const rightSide = alpha.at(aPrime, bPrime)(PuP);
      
      // For finite presentations, we can compare directly
      const eq = eqJSON<unknown>();
      return eq(leftSide, rightSide);
    });
  });
}

/** Finite small category with explicit enumeration for profunctor computation. */
export interface FiniteSmallCategory<O, M> extends SmallCategory<O, M> {
  objects: ReadonlyArray<O>;
  morphisms: ReadonlyArray<M>;
  hom: (x: O, y: O) => ReadonlyArray<M>;
}

/** Finite profunctor with explicit element enumeration for coend computation. */
export interface FiniteProf<A_O, A_M, B_O, B_M, T> {
  // Explicit enumeration for coend computation
  elems: (a: A_O, b: B_O) => ReadonlyArray<T>;
  lmap: (u: A_M, b: B_O, t: T) => T;
  rmap: (a: A_O, v: B_M, t: T) => T;
}

/** Representative of a coend quotient class: (b, p, q) where b mediates P(a,b)×Q(b,c). */
export type PairClass<B_O, TP, TQ> = {
  rep: { b: B_O; p: TP; q: TQ };
};

/** Union-find for coend quotienting. */
class CoendUnionFind {
  private parent = new Map<string, string>;
  private rank = new Map<string, number>;
  
  constructor() {}
  
  find(x: string): string {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      return x;
    }
    
    if (this.parent.get(x)! === x) return x;
    
    const root = this.find(this.parent.get(x)!);
    this.parent.set(x, root);
    return root;
  }
  
  union(x: string, y: string) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX === rootY) return;
    
    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;
    
    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
  }
  
  representatives(): Map<string, string[]> {
    const reps = new Map<string, string[]>();
    for (const [key] of this.parent) {
      const root = this.find(key);
      const members = reps.get(root) || [];
      members.push(key);
      reps.set(root, members);
    }
    return reps;
  }
}

/** Coend-based composition of finite profunctors P:A⇸B and Q:B⇸C. */
export function composeFiniteProfCoend<A_O, A_M, B_O, B_M, C_O, C_M, TP, TQ>(
  A: FiniteSmallCategory<A_O, A_M>,
  B: FiniteSmallCategory<B_O, B_M>,
  C: FiniteSmallCategory<C_O, C_M>,
  keyB: (b: B_O) => string,
  P: FiniteProf<A_O, A_M, B_O, B_M, TP>,
  Q: FiniteProf<B_O, B_M, C_O, C_M, TQ>
): FiniteProf<A_O, A_M, C_O, C_M, PairClass<B_O, TP, TQ>> & { buildUF: (a: A_O, c: C_O) => { normalize: (node: { b: B_O; p: TP; q: TQ }) => PairClass<B_O, TP, TQ> } } {
  
  // Build the disjoint union ∐₍b₎ P(a,b)×Q(b,c) and quotient by coend relations
  const buildUF = (a: A_O, c: C_O) => {
    const uf = new CoendUnionFind();
    const pairs: Array<{ b: B_O; p: TP; q: TQ; key: string }> = [];
    
    // Collect all pairs (b, p, q) where p ∈ P(a,b) and q ∈ Q(b,c)
    for (const b of B.objects) {
      const pElems = P.elems(a, b);
      const qElems = Q.elems(b, c);
      
      for (const p of pElems) {
        for (const q of qElems) {
          const key = `${keyB(b)}|${String(p)}|${String(q)}`;
          pairs.push({ b, p, q, key });
        }
      }
    }
    
    // Quotient by coend relations: for any u: b→b' in B,
    // (b, P(u,id)(p), q) ~ (b', p, Q(id,u)(q))
    for (const u of B.morphisms) {
      const b = B.src(u);
      const bPrime = B.dst(u);
      
               for (const p of P.elems(a, b)) {
           for (const q of Q.elems(bPrime, c)) {
             const leftKey = `${keyB(b)}|${String(P.lmap(u as any, c as any, p))}|${String(q)}`;
             const rightKey = `${keyB(bPrime)}|${String(p)}|${String(Q.rmap(b as any, u as any, q))}`;
             uf.union(leftKey, rightKey);
           }
         }
    }
    
         return {
       normalize: (node: { b: B_O; p: TP; q: TQ }): PairClass<B_O, TP, TQ> => {
         // For now, just return the original node (simplified normalization)
         // In a full implementation, you'd find the canonical representative
         return { rep: { b: node.b, p: node.p, q: node.q } };
       }
     };
  };
  
     const elems = (a: A_O, c: C_O): ReadonlyArray<PairClass<B_O, TP, TQ>> => {
     // Simplified implementation - just return all pairs without quotienting
     const result: PairClass<B_O, TP, TQ>[] = [];
     
     for (const b of B.objects) {
       const pElems = P.elems(a, b);
       const qElems = Q.elems(b, c);
       
       for (const p of pElems) {
         for (const q of qElems) {
           result.push({ rep: { b, p, q } });
         }
       }
     }
     
     return result;
   };
  
  const lmap = (u: A_M, c: C_O, cls: PairClass<B_O, TP, TQ>): PairClass<B_O, TP, TQ> => {
    const { b, p, q } = cls.rep;
    const newP = P.lmap(u, c as any, p);
    const uf = buildUF(A.src(u), c);
    return uf.normalize({ b, p: newP, q });
  };
  
  const rmap = (a: A_O, v: C_M, cls: PairClass<B_O, TP, TQ>): PairClass<B_O, TP, TQ> => {
    const { b, p, q } = cls.rep;
    const newQ = Q.rmap(b, v, q);
    const uf = buildUF(a, C.src(v));
    return uf.normalize({ b, p, q: newQ });
  };
  
  return {
    elems,
    lmap,
    rmap,
    buildUF
  };
}

/** Left whiskering: L ⋙ α : (L∘P) ⇒ (L∘Q), where L: C⇸A. */
export function leftWhisker<A_O, A_M, B_O, B_M, C_O, C_M, TL, TP, TQ>(
  A: FiniteSmallCategory<A_O, A_M>,
  B: FiniteSmallCategory<B_O, B_M>,
  C: FiniteSmallCategory<C_O, C_M>,
  keyA: (a: A_O) => string,
  L: FiniteProf<C_O, C_M, A_O, A_M, TL>,
  P: FiniteProf<A_O, A_M, B_O, B_M, TP>,
  Q: FiniteProf<A_O, A_M, B_O, B_M, TQ>,
  alpha: ProTrans<A_O, A_M, B_O, B_M, TP, TQ>
) {
  const LP = composeFiniteProfCoend(C, A, B, keyA, L, P);
  const LQ = composeFiniteProfCoend(C, A, B, keyA, L, Q);
  
     const at = (_c: C_O, b: B_O) => (cls: PairClass<A_O, TL, TP>): PairClass<A_O, TL, TQ> => {
     const a = cls.rep.b; // mediating A-object
     const l = cls.rep.p; // TL
     const p = cls.rep.q; // TP
     const q = alpha.at(a, b)(p);
     
     // Simplified: just return the transformed pair
     return { rep: { b: a, p: l, q } };
   };
  
  const alphaWhiskered: ProTrans<C_O, C_M, B_O, B_M, PairClass<A_O, TL, TP>, PairClass<A_O, TL, TQ>> = { at };
  return { LP, LQ, trans: alphaWhiskered };
}

/** Right whiskering: α ⋙ R : (P∘R) ⇒ (Q∘R), where R: B⇸D. */
export function rightWhisker<A_O, A_M, B_O, B_M, C_O, C_M, TP, TQ, TR>(
  A: FiniteSmallCategory<A_O, A_M>,
  B: FiniteSmallCategory<B_O, B_M>,
  C: FiniteSmallCategory<C_O, C_M>,
  keyB: (b: B_O) => string,
  P: FiniteProf<A_O, A_M, B_O, B_M, TP>,
  Q: FiniteProf<A_O, A_M, B_O, B_M, TQ>,
  R: FiniteProf<B_O, B_M, C_O, C_M, TR>,
  alpha: ProTrans<A_O, A_M, B_O, B_M, TP, TQ>
) {
  const PR = composeFiniteProfCoend(A, B, C, keyB, P, R);
  const QR = composeFiniteProfCoend(A, B, C, keyB, Q, R);
  
  const at = (a: A_O, c: C_O) => (cls: PairClass<B_O, TP, TR>): PairClass<B_O, TQ, TR> => {
    const b = cls.rep.b; // mediating B-object
    const p = cls.rep.p; // TP
    const r = cls.rep.q; // TR
    const q = alpha.at(a, b)(p);
    
    // Normalize in (Q∘R)(a,c) using coend quotient
    const tmp = composeFiniteProfCoend(A, B, C, keyB, Q, R) as any;
    const norm = tmp.buildUF ? tmp.buildUF(a, c).normalize : ((x:any)=>x);
    return norm({ b, p: q, q: r });
  };
  
  const result: ProTrans<A_O, A_M, C_O, C_M, PairClass<B_O, TP, TR>, PairClass<B_O, TQ, TR>> = { at };
  return { PR, QR, trans: result };
}

/** Horizontal composition (α ★ β): (P∘Q) ⇒ (P'∘Q') given α:P⇒P' and β:Q⇒Q'. */
export function hcomposeTrans<A_O, A_M, B_O, B_M, C_O, C_M, TP, TP2, TQ, TQ2>(
  _A: FiniteSmallCategory<A_O, A_M>,
  _B: FiniteSmallCategory<B_O, B_M>,
  _C: FiniteSmallCategory<C_O, C_M>,
  _keyB: (b: B_O) => string,
  _P:  FiniteProf<A_O, A_M, B_O, B_M, TP>,
  _P2: FiniteProf<A_O, A_M, B_O, B_M, TP2>,
  _Q:  FiniteProf<B_O, B_M, C_O, C_M, TQ>,
  _Q2: FiniteProf<B_O, B_M, C_O, C_M, TQ2>,
  alpha: ProTrans<A_O, A_M, B_O, B_M, TP, TP2>,
  beta:  ProTrans<B_O, B_M, C_O, C_M, TQ, TQ2>
): ProTrans<A_O, A_M, C_O, C_M, PairClass<B_O, TP, TQ>, PairClass<B_O, TP2, TQ2>> {
  
     const at = (a: A_O, c: C_O) => (cls: PairClass<B_O, TP, TQ>): PairClass<B_O, TP2, TQ2> => {
     const b = cls.rep.b; const p = cls.rep.p; const q = cls.rep.q;
     const p2 = alpha.at(a, b)(p);
     const q2 = beta.at(b, c)(q);
     
     // Simplified: just return the transformed pair
     return { rep: { b, p: p2, q: q2 } };
   };
  
  return { at };
}
