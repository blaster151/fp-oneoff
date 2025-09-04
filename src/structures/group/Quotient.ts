import { FiniteGroup, checkGroup } from "./Group";
import { GroupHom } from "./GrpCat";

/** Left coset of N in G represented by a chosen representative g∈G. */
export type Coset<A> = { rep: A };

/** Check normality: ∀x∈G, n∈N, x n x⁻¹ ∈ N. */
export function isNormal<A>(
  G: FiniteGroup<A>,
  N: FiniteGroup<A>,
): boolean {
  const { elems: Ge, op, inv } = G;
  const inN = (x: A) => N.elems.some(n => N.eq(n, x));
  for (const x of Ge) {
    for (const n of N.elems) {
      const xnx = op(op(x, n), inv(x));
      if (!inN(xnx)) return false;
    }
  }
  return true;
}

/** Left cosets list for normal subgroup N ⫳ G. */
export function leftCosets<A>(
  G: FiniteGroup<A>,
  N: FiniteGroup<A>,
): Coset<A>[] {
  const seen: A[] = [];
  const res: Coset<A>[] = [];
  const inSeen = (a: A) => seen.some(s => G.eq(s, a));

  const inN = (x: A) => N.elems.some(n => N.eq(n, x));

  // mark whole coset by marking all members
  const markCoset = (g: A) => {
    for (const n of N.elems) {
      const gn = G.op(g, n);
      if (!inSeen(gn)) seen.push(gn);
    }
  };

  for (const g of G.elems) {
    if (inSeen(g)) continue;
    res.push({ rep: g });
    markCoset(g);
  }
  // sanity: identity coset included, size divides |G|
  if (!res.length) throw new Error("no cosets?");
  return res;
}

/** Decide equality of left cosets gN = hN (N normal) */
export function cosetEq<A>(G: FiniteGroup<A>, N: FiniteGroup<A>) {
  const inN = (x: A) => N.elems.some(n => N.eq(n, x));
  return (c1: Coset<A>, c2: Coset<A>) => {
    // gN = hN  iff  g⁻¹h ∈ N
    const g = c1.rep, h = c2.rep;
    return inN(G.op(G.inv(g), h));
  };
}

/** Operation on cosets: (gN)·(hN) = (gh)N  (well-defined when N ⫳ G). */
export function cosetOp<A>(G: FiniteGroup<A>, N: FiniteGroup<A>) {
  return (x: Coset<A>, y: Coset<A>): Coset<A> => ({ rep: G.op(x.rep, y.rep) });
}

/** Inverse on cosets: (gN)⁻¹ = (g⁻¹)N */
export function cosetInv<A>(G: FiniteGroup<A>) {
  return (x: Coset<A>): Coset<A> => ({ rep: G.inv(x.rep) });
}

/** Build the quotient group G/N given N ⫳ G. */
export function quotientGroup<A>(
  G: FiniteGroup<A>,
  N: FiniteGroup<A>,
): FiniteGroup<Coset<A>> {
  if (!isNormal(G, N)) throw new Error("quotientGroup: N is not normal in G");
  const elems = leftCosets(G, N);
  const eq = cosetEq(G, N);
  const op = cosetOp(G, N);
  const e = { rep: G.id };
  const inv = cosetInv(G);
  const Q: FiniteGroup<Coset<A>> = { elems, eq, op, id: e, inv, label: `${G.label}/${N.label}` };
  checkGroup(Q); // throw if laws fail
  return Q;
}

/** Canonical projection π : G → G/N, g ↦ [g] */
export function projToQuotient<A>(
  G: FiniteGroup<A>,
  N: FiniteGroup<A>,
): GroupHom<A, Coset<A>> {
  const Q = quotientGroup(G, N);
  const f = (g: A) => ({ rep: g });
  return { f, verify: () => true };
}

/** Kernel of hom f : G→H (as subgroup of G). */
export function kernel<A,B>(
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  f: GroupHom<A,B>,
): FiniteGroup<A> {
  const elems = G.elems.filter(a => H.eq(f.f(a), H.id));
  return { elems, eq: G.eq, op: G.op, id: G.id, inv: G.inv, label: `ker` };
}

/** Image of f : G→H (as subgroup of H). */
export function image<A,B>(
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  f: GroupHom<A,B>,
): FiniteGroup<B> {
  const img: B[] = [];
  const seen = (x: B) => img.some(y => H.eq(x, y));
  for (const a of G.elems) {
    const b = f.f(a);
    if (!seen(b)) img.push(b);
  }
  return { elems: img, eq: H.eq, op: H.op, id: H.id, inv: H.inv, label: `im` };
}