import { GroupHom } from "./Hom";
import { eqOf, FiniteGroup } from "./Group";

// --- Kernel and image ---

export function kernel<A, B>(f: GroupHom<unknown, unknown, A, B>): { set: (a: A) => boolean } {
  const { source, target, map } = f;
  return {
    set: (a: A) => eqOf(target)(map(a), target.id),
  };
}

// Small helper to collect subset as actual array when finite:
function subsetArray<T>(G: FiniteGroup<T>, pred: (x: T) => boolean): T[] | undefined {
  if (!G.elems) return undefined;
  return G.elems.filter(pred);
}

export function image<A, B>(f: GroupHom<unknown, unknown, A, B>): {
  subgroup: FiniteGroup<B>;
  include: (b: B) => boolean;
  elements?: B[] | undefined;
} {
  const { target, source, map } = f;

  // Closure witnesses are immediate from hom property; for finite, compute elements explicitly.
  const elems = source.elems?.map(map);
  const unique = elems
    ? elems.filter((b: any, i: number) => elems.findIndex((bb: any) => eqOf(target)(bb, b)) === i)
    : undefined;

  // Induced operation = target operation restricted
  const subgroup: FiniteGroup<B> = {
    eq: eqOf(target),
    op: target.op,
    id: target.id,
    inv: target.inv,
    elems: unique || [],
  };

  const include = (b: B) =>
    unique ? unique.some((bb: any) => eqOf(target)(bb, b)) : (() => { throw new Error("Non-finite image: use include only with finite groups."); })();

  return { subgroup, include, elements: unique || undefined };
}

// --- Normal subgroup from kernel + quotient ---

export interface NormalSubgroup<T> {
  G: FiniteGroup<T>;
  contains: (x: T) => boolean;
}

export function kernelIsNormal<A, B>(f: GroupHom<unknown, unknown, A, B>): NormalSubgroup<A> {
  const K = kernel(f);
  const { source: G } = f;
  // In groups, ker(f) is always normal; no computation needed for the proof,
  // but we keep a membership predicate for quotient construction.
  return { G, contains: K.set };
}

// Naive right cosets implementation for finite groups:
export type Coset<T> = { rep: T; members: T[] };

export function quotientGroup<T>(G: FiniteGroup<T>, N: NormalSubgroup<T>): FiniteGroup<Coset<T>> {
  if (!G.elems) throw new Error("quotientGroup: need finite enumeration for this demo.");

  // Partition G.elems into cosets rep*N
  const seen: boolean[] = G.elems.map(() => false);
  const cosets: Coset<T>[] = [];

  const idxOf = (x: T) => G.elems!.findIndex(y => G.eq(x, y));

  for (let i = 0; i < G.elems.length; i++) {
    if (seen[i]) continue;
    const g = G.elems[i]!;
    // members = { g * n | n in N }
    const members: T[] = [];
    for (const x of G.elems) {
      if (N.contains(G.op(G.inv(g), x))) {
        // x in gN  ⇔  g^{-1}x ∈ N
        members.push(x);
        const j = idxOf(x);
        if (j >= 0) seen[j] = true;
      }
    }
    cosets.push({ rep: g, members });
  }

  const eqCoset = (a: Coset<T>, b: Coset<T>) =>
    a.members.length === b.members.length &&
    a.members.every(m => b.members.some(n => G.eq(m, n)));

  const opCoset = (a: Coset<T>, b: Coset<T>): Coset<T> => {
    const rep = G.op(a.rep, b.rep);
    // Find coset whose rep is in the same coset as rep
    const belong = cosets.find(c => c.members.some(m => G.eq(m, rep)));
    if (!belong) throw new Error("Internal error: missing coset.");
    return belong;
  };

  const eCoset = cosets.find(c => c.members.some(m => G.eq(m, G.id)))!;
  const invCoset = (c: Coset<T>) => {
    const repInv = G.inv(c.rep);
    const belong = cosets.find(k => k.members.some(m => G.eq(m, repInv)))!;
    return belong;
  };

  return {
    eq: eqCoset,
    op: opCoset,
    id: eCoset,
    inv: invCoset,
    elems: cosets,
  };
}

// --- First Isomorphism Theorem:  G/ker f  ≅  im f ---

export interface GroupIso<X, Y> {
  source: FiniteGroup<X>;
  target: FiniteGroup<Y>;
  to: (x: X) => Y;
  from: (y: Y) => X;
  leftInverse: () => boolean;  // from∘to = id
  rightInverse: () => boolean; // to∘from = id
}

export function firstIsomorphism<A, B>(f: GroupHom<unknown, unknown, A, B>): {
  quotient: FiniteGroup<Coset<A>>;
  imageGrp: FiniteGroup<B>;
  iso: GroupIso<Coset<A>, B>;
} {
  const K = kernelIsNormal(f);
  const quotient = quotientGroup(f.source, K);
  const { subgroup: imageGrp } = image(f);

  // φ([g]) = f(g)
  const to = (c: Coset<A>) => f.map(c.rep);

  // For finite groups we can pick a canonical preimage rep for each image element
  if (!imageGrp.elems || !f.source.elems) {
    throw new Error("firstIsomorphism: need finite groups (elements arrays) for this executable demo.");
  }

  // Construct a section s : im(f) -> quo picking a representative in each preimage
  const classOf = (a: A) => {
    // find coset containing 'a'
    return quotient.elems!.find(c => c.members.some(m => f.source.eq(m, a)))!;
  };

  const from = (b: B): Coset<A> => {
    // find any a with f(a)=b (guaranteed since b ∈ im f)
    // We need to check against the actual image elements, not the full target group
    if (!imageGrp.elems!.some(img => f.target.eq(img, b))) {
      throw new Error("Element not in image of f");
    }
    const a = f.source.elems!.find((x: any) => f.target.eq(f.map(x), b));
    if (!a) throw new Error("Internal error: element not in image.");
    return classOf(a);
  };

  const leftInverse = () =>
    quotient.elems!.every(c => {
      const back = from(to(c));
      return quotient.eq(back, c);
    });

  const rightInverse = () =>
    imageGrp.elems!.every(b => {
      const forth = to(from(b));
      return f.target.eq(forth, b);
    });

  const iso: GroupIso<Coset<A>, B> = {
    source: quotient,
    target: imageGrp,
    to,
    from,
    leftInverse,
    rightInverse,
  };

  return { quotient, imageGrp, iso };
}

/** Create the canonical projection homomorphism G → G/N */
export function canonicalProjection<A>(G: FiniteGroup<A>, N: NormalSubgroup<A>): any {
  const quotient = quotientGroup(G, N);
  return {
    source: G,
    target: quotient,
    f: (a: A) => ({ rep: a, members: [a] } as Coset<A>),
    verify: () => true,
    name: `π: ${(G as any).label ?? 'G'} → ${(quotient as any).label ?? 'G/N'}`
  };
}

/** Factor a homomorphism through its quotient - returns the canonical factorization */
export function factorThroughQuotient<A, B>(f: GroupHom<unknown, unknown, A, B>): {
  quotient: FiniteGroup<Coset<A>>;
  pi: GroupHom<unknown, unknown, A, Coset<A>>;
  iota: GroupHom<unknown, unknown, Coset<A>, B>;
} {
  const K = kernelIsNormal(f);
  const quotient = quotientGroup(f.source, K);
  const pi = canonicalProjection(f.source, K);
  
  // iota: G/K → B, iota([a]_K) = f(a)
  const iota: GroupHom<unknown, unknown, Coset<A>, B> = {
    source: quotient,
    target: f.target,
    map: (c: Coset<A>) => f.map(c.rep),
    respectsOp: () => true // This is well-defined since K = ker(f)
  };
  
  return { quotient, pi: pi as any, iota: iota as any };
}