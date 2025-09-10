import { FiniteGroup } from "../Group";
import { isoLaws } from "../../../laws/Witness";

/**
 * A concrete isomorphism record (does NOT extend the GroupHom interface).
 * Holds source/target groups plus forward/inverse maps and provides checks.
 */
export class GroupIsomorphism<A, B> {
  constructor(
    public readonly G: FiniteGroup<A>,
    public readonly H: FiniteGroup<B>,
    public readonly map: (a: A) => B,
    public readonly inverse: (b: B) => A
  ) {}

  /** Witness law: inverse(map(a)) === a for all a in G (finite check). */
  leftInverse(): boolean {
    const { G, map, inverse } = this;
    const eqA = G.eq ?? ((x: A, y: A) => x === y);
    if (!G.elems) throw new Error("leftInverse requires finite G (no elems).");
    return G.elems.every((a) => eqA(inverse(map(a)), a));
  }

  /** Witness law: map(inverse(b)) === b for all b in H (finite check). */
  rightInverse(): boolean {
    const { H, map, inverse } = this;
    const eqB = H.eq ?? ((x: B, y: B) => x === y);
    if (!H.elems) throw new Error("rightInverse requires finite H (no elems).");
    return H.elems.every((b) => eqB(map(inverse(b)), b));
  }

  /** Check map is a homomorphism and preserves identity on finite carriers. */
  private preservesOpAndId(): boolean {
    const { G, H, map } = this;
    const eqB = H.eq ?? ((x: B, y: B) => x === y);

    // preserves identity
    if (!eqB(map(G.id), H.id)) return false;

    // preserves operation (finite brute-force)
    for (const a of G.elems) for (const b of G.elems) {
      const lhs = map(G.op(a, b));
      const rhs = H.op(map(a), map(b));
      if (!eqB(lhs, rhs)) return false;
    }
    return true;
  }

  /** Verify all isomorphism laws with finite checks. */
  verifyIsomorphism(): boolean {
    return this.preservesOpAndId() && this.leftInverse() && this.rightInverse();
  }

  /** Bundle laws for your law-testing framework. */
  getIsomorphismLaws() {
    const { G, H, map, inverse } = this;
    const eqA = G.eq ?? ((x: A, y: A) => x === y);
    const eqB = H.eq ?? ((x: B, y: B) => x === y);
    return isoLaws(eqA, eqB, { to: map, from: inverse });
  }

  /** Compose two isomorphisms. */
  compose<C>(other: GroupIsomorphism<B, C>): GroupIsomorphism<A, C> {
    const { G, map, inverse } = this;
    const K = other.H;
    const g = other.map;
    const gInv = other.inverse;
    return new GroupIsomorphism(
      G,
      K,
      (a: A) => g(map(a)),
      (c: C) => inverse(gInv(c))
    );
  }

  /** Inverse isomorphism. */
  getInverse(): GroupIsomorphism<B, A> {
    const { G, H, map, inverse } = this;
    return new GroupIsomorphism(H, G, inverse, map);
  }
}

/** GroupAutomorphism alias for isomorphisms from a group to itself. */
export type GroupAutomorphism<A> = GroupIsomorphism<A, A>;

/** Identity automorphism. */
export function identityAutomorphism<A>(G: FiniteGroup<A>): GroupAutomorphism<A> {
  return new GroupIsomorphism(G, G, (a) => a, (a) => a);
}

/** Negation automorphism for additive finite groups (modular). */
export function negationAutomorphism(G: FiniteGroup<number>): GroupAutomorphism<number> {
  const order = G.elems?.length ?? 1;
  return new GroupIsomorphism(
    G,
    G,
    (n) => (order - n) % order,
    (n) => (order - n) % order
  );
}

/** Scaling automorphism for additive finite groups (uses modular inverse). */
export function scalingAutomorphism(G: FiniteGroup<number>, factor: number): GroupAutomorphism<number> {
  if (factor === 0) throw new Error("Scaling factor cannot be zero");
  const order = G.elems?.length ?? 1;
  const inv = modInverse(factor, order);
  return new GroupIsomorphism(
    G,
    G,
    (n) => (factor * n) % order,
    (n) => (inv * n) % order
  );
}

/** Conjugation automorphism: x ↦ g * x * g^{-1}. */
export function conjugationAutomorphism<A>(G: FiniteGroup<A>, g: A): GroupAutomorphism<A> {
  return new GroupIsomorphism(
    G,
    G,
    (x) => G.op(G.op(g, x), G.inv(g)),
    (x) => G.op(G.op(G.inv(g), x), g)
  );
}

/** Power automorphism: x ↦ x^k (finite, via repeated op); inverse via modular inverse of k. */
export function powerAutomorphism<A>(G: FiniteGroup<A>, k: number): GroupAutomorphism<A> {
  const order = G.elems?.length ?? 1;
  const kInv = modInverse(k, order);

  const pow = (x: A, times: number): A => {
    let acc = G.id;
    for (let i = 0; i < times; i++) acc = G.op(acc, x);
    return acc;
  };

  return new GroupIsomorphism(
    G,
    G,
    (x) => pow(x, k),
    (x) => pow(x, kInv)
  );
}

/** Naive modular inverse (for demo purposes). */
function modInverse(a: number, m: number): number {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  throw new Error(`No modular inverse exists for ${a} mod ${m}`);
}

/** Alias for clarity. */
function modInverseOf(a: number, m: number): number {
  return modInverse(a, m);
}
