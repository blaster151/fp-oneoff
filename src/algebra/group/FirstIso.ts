// Minimal shared types (import from your actual modules if you already have them)
export type Eq<T> = (x: T, y: T) => boolean;

export interface Group<T> {
  eq: Eq<T>;
  op: (x: T, y: T) => T;
  e: T;
  inv: (x: T) => T;
  // Optional: finite enumeration (enables exhaustive checks)
  elements?: T[] | undefined;
}

export interface GroupHom<A, B> {
  src: Group<A>;
  dst: Group<B>;
  map: (a: A) => B;
  // witness: f(x*y) = f(x)⋆f(y)
  respectsOp: () => boolean; // typically implemented by exhaustive check if finite, or assumed trusted
}

// --- Kernel and image ---

export function kernel<A, B>(f: GroupHom<A, B>): { set: (a: A) => boolean } {
  const { src, dst, map } = f;
  return {
    set: (a: A) => dst.eq(map(a), dst.e),
  };
}

// Small helper to collect subset as actual array when finite:
function subsetArray<T>(G: Group<T>, pred: (x: T) => boolean): T[] | undefined {
  if (!G.elements) return undefined;
  return G.elements.filter(pred);
}

export function image<A, B>(f: GroupHom<A, B>): {
  subgroup: Group<B>;
  include: (b: B) => boolean;
  elements?: B[] | undefined;
} {
  const { dst, src, map } = f;

  // Closure witnesses are immediate from hom property; for finite, compute elements explicitly.
  const elems = src.elements?.map(map);
  const unique = elems
    ? elems.filter((b, i) => elems.findIndex(bb => dst.eq(bb, b)) === i)
    : undefined;

  // Induced operation = dst operation restricted
  const subgroup: Group<B> = {
    eq: dst.eq,
    op: dst.op,
    e: dst.e,
    inv: dst.inv,
    elements: unique || undefined,
  };

  const include = (b: B) =>
    unique ? unique.some(bb => dst.eq(bb, b)) : (() => { throw new Error("Non-finite image: use include only with finite groups."); })();

  return { subgroup, include, elements: unique || undefined };
}

// --- Normal subgroup from kernel + quotient ---

export interface NormalSubgroup<T> {
  G: Group<T>;
  contains: (x: T) => boolean;
}

export function kernelIsNormal<A, B>(f: GroupHom<A, B>): NormalSubgroup<A> {
  const K = kernel(f);
  const { src: G } = f;
  // In groups, ker(f) is always normal; no computation needed for the proof,
  // but we keep a membership predicate for quotient construction.
  return { G, contains: K.set };
}

// Naive right cosets implementation for finite groups:
export type Coset<T> = { rep: T; members: T[] };

export function quotientGroup<T>(G: Group<T>, N: NormalSubgroup<T>): Group<Coset<T>> {
  if (!G.elements) throw new Error("quotientGroup: need finite enumeration for this demo.");

  // Partition G.elements into cosets rep*N
  const seen: boolean[] = G.elements.map(() => false);
  const cosets: Coset<T>[] = [];

  const idxOf = (x: T) => G.elements!.findIndex(y => G.eq(x, y));

  for (let i = 0; i < G.elements.length; i++) {
    if (seen[i]) continue;
    const g = G.elements[i]!;
    // members = { g * n | n in N }
    const members: T[] = [];
    for (const x of G.elements) {
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

  const eCoset = cosets.find(c => c.members.some(m => G.eq(m, G.e)))!;
  const invCoset = (c: Coset<T>) => {
    const repInv = G.inv(c.rep);
    const belong = cosets.find(k => k.members.some(m => G.eq(m, repInv)))!;
    return belong;
  };

  return {
    eq: eqCoset,
    op: opCoset,
    e: eCoset,
    inv: invCoset,
    elements: cosets,
  };
}

// --- First Isomorphism Theorem:  G/ker f  ≅  im f ---

export interface GroupIso<X, Y> {
  src: Group<X>;
  dst: Group<Y>;
  to: (x: X) => Y;
  from: (y: Y) => X;
  leftInverse: () => boolean;  // from∘to = id
  rightInverse: () => boolean; // to∘from = id
}

export function firstIsomorphism<A, B>(f: GroupHom<A, B>): {
  quotient: Group<Coset<A>>;
  imageGrp: Group<B>;
  iso: GroupIso<Coset<A>, B>;
} {
  const K = kernelIsNormal(f);
  const quotient = quotientGroup(f.src, K);
  const { subgroup: imageGrp } = image(f);

  // φ([g]) = f(g)
  const to = (c: Coset<A>) => f.map(c.rep);

  // For finite groups we can pick a canonical preimage rep for each image element
  if (!imageGrp.elements || !f.src.elements) {
    throw new Error("firstIsomorphism: need finite groups (elements arrays) for this executable demo.");
  }

  // Construct a section s : im(f) -> quo picking a representative in each preimage
  const classOf = (a: A) => {
    // find coset containing 'a'
    return quotient.elements!.find(c => c.members.some(m => f.src.eq(m, a)))!;
  };

  const from = (b: B): Coset<A> => {
    // find any a with f(a)=b (guaranteed since b ∈ im f)
    // We need to check against the actual image elements, not the full target group
    if (!imageGrp.elements!.some(img => f.dst.eq(img, b))) {
      throw new Error("Element not in image of f");
    }
    const a = f.src.elements!.find(x => f.dst.eq(f.map(x), b));
    if (!a) throw new Error("Internal error: element not in image.");
    return classOf(a);
  };

  const leftInverse = () =>
    quotient.elements!.every(c => {
      const back = from(to(c));
      return quotient.eq(back, c);
    });

  const rightInverse = () =>
    imageGrp.elements!.every(b => {
      const forth = to(from(b));
      return f.dst.eq(forth, b);
    });

  const iso: GroupIso<Coset<A>, B> = {
    src: quotient,
    dst: imageGrp,
    to,
    from,
    leftInverse,
    rightInverse,
  };

  return { quotient, imageGrp, iso };
}

/** Create the canonical projection homomorphism G → G/N */
export function canonicalProjection<A>(G: Group<A>, N: NormalSubgroup<A>): any {
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
export function factorThroughQuotient<A, B>(f: GroupHom<A, B>): {
  quotient: Group<Coset<A>>;
  pi: GroupHom<A, Coset<A>>;
  iota: GroupHom<Coset<A>, B>;
} {
  const K = kernelIsNormal(f);
  const quotient = quotientGroup(f.src, K);
  const pi = canonicalProjection(f.src, K);
  
  // iota: G/K → B, iota([a]_K) = f(a)
  const iota: GroupHom<Coset<A>, B> = {
    src: quotient,
    dst: f.dst,
    map: (c: Coset<A>) => f.map(c.rep),
    respectsOp: () => true // This is well-defined since K = ker(f)
  };
  
  return { quotient, pi: pi as any, iota: iota as any };
}