// Minimal, runtime-checkable group structure over a concrete carrier `A`
// We support both finite carriers (enumerated) and infinite ones (no enumeration).
export interface Group<A> {
  readonly eq: (x: A, y: A) => boolean;   // decidable equality for tests/witnesses
  readonly op: (x: A, y: A) => A;          // group operation (associative)
  readonly id: A;                          // identity element
  readonly inv: (x: A) => A;               // inverse
  // Optional: total listing of elements for finite groups (enables decision procedures)
  readonly elements?: readonly A[];
}

// Alias for backward compatibility
export type FiniteGroup<A> = Group<A>;

// Structure-respecting map between groups
export interface GroupHom<A, B> {
  readonly source: Group<A>;
  readonly target: Group<B>;
  readonly map: (a: A) => B;
}

// Isomorphism = homomorphism with a **homomorphic**, two-sided inverse.
// We store both directions plus explicit witnesses of the laws.
export interface GroupIso<A, B> {
  readonly to: GroupHom<A, B>;
  readonly from: GroupHom<B, A>;
  // Witnesses (verifiable for finite groups)
  readonly leftInverse: (b: B) => boolean;  // from.map(to.map(a)) == a  (checked via source.elements if present)
  readonly rightInverse: (a: A) => boolean; // to.map(from.map(b)) == b  (checked via target.elements if present)
}

// Narrow special case: automorphism
export type GroupAuto<A> = GroupIso<A, A>;

// --- Utilities ---

export function isHomomorphism<A, B>(h: GroupHom<A, B>): boolean {
  const { source: G, target: H, map: f } = h;
  if (!G.elements) return true; // cannot decide; assume responsibility to the caller
  // identity law: f(e_G) = e_H
  if (!H.eq(f(G.id), H.id)) return false;
  // operation preservation: f(x * y) = f(x) ⋆ f(y)
  for (const x of G.elements) {
    for (const y of G.elements) {
      const lhs = f(G.op(x, y));
      const rhs = H.op(f(x), f(y));
      if (!H.eq(lhs, rhs)) return false;
    }
  }
  return true;
}

export function isBijectionFinite<A, B>(h: GroupHom<A, B>): boolean {
  const { source: G, target: H, map: f } = h;
  if (!G.elements || !H.elements) return false;
  if (G.elements.length !== H.elements.length) return false;
  // injective + surjective via images covering without collisions
  const image: B[] = G.elements.map(f);
  // surjective: every target element appears in image
  for (const b of H.elements) {
    if (!image.some(x => H.eq(x, b))) return false;
  }
  // injective: equal images imply equal preimages
  for (let i = 0; i < G.elements.length; i++) {
    for (let j = i + 1; j < G.elements.length; j++) {
      const bi = image[i], bj = image[j];
      if (H.eq(bi, bj) && !G.eq(G.elements[i], G.elements[j])) return false;
    }
  }
  return true;
}

// Check the "redefined" characterization (Theorem 4):
// A homomorphism is an iso iff there exists a homomorphic two-sided inverse.
export function isIsomorphismByInverse<A, B>(iso: GroupIso<A, B>): boolean {
  const { to, from, leftInverse, rightInverse } = iso;
  if (!isHomomorphism(to)) return false;
  if (!isHomomorphism(from)) return false;
  // If we can enumerate, check witnesses everywhere; otherwise trust the provided functions
  const allA: A[] | undefined = to.source.elements?.slice();
  const allB: B[] | undefined = to.target.elements?.slice();

  if (allA) {
    for (const a of allA) {
      const b = to.map(a);
      const back = from.map(b);
      if (!to.source.eq(back, a)) return false;
      if (!rightInverse(a)) return false;
    }
  }
  if (allB) {
    for (const b of allB) {
      const a = from.map(b);
      const forth = to.map(a);
      if (!to.target.eq(forth, b)) return false;
      if (!leftInverse(b)) return false;
    }
  }
  return true;
}

// For finite groups, decide isomorphism by explicit inverse + hom laws + bijectivity.
export function isIsomorphismFinite<A, B>(iso: GroupIso<A, B>): boolean {
  const bij = isBijectionFinite(iso.to);
  return bij && isIsomorphismByInverse(iso);
}