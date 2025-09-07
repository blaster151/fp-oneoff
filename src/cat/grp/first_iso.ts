import { FinGroup, FinGroupMor } from "./FinGrp"; // adjust import path

// Compute kernel: elements sent to identity in H
export function kernel<A, B>(G: FinGroup<A>, H: FinGroup<B>, f: FinGroupMor<A, B>): A[] {
  return G.carrier.filter(a => H.eq(f.run(a), H.e));
}

// Compute image: all values attained by f
export function image<A, B>(G: FinGroup<A>, f: FinGroupMor<A, B>): B[] {
  const seen: B[] = [];
  G.carrier.forEach(a => {
    const b = f.run(a);
    if (!seen.some(x => Object.is(x, b))) seen.push(b);
  });
  return seen;
}

// Cosets: aK = { a * k | k ∈ K } (left cosets)
export function cosets<A>(G: FinGroup<A>, K: A[]): A[][] {
  const used: A[] = [];
  const reps: A[][] = [];
  G.carrier.forEach(a => {
    if (used.some(u => G.eq(u, a))) return;
    const coset: A[] = [];
    K.forEach(k => {
      const prod = G.op(a, k); // a * k (left coset)
      coset.push(prod);
    });
    coset.forEach(x => used.push(x));
    reps.push(coset);
  });
  return reps;
}

// First Iso Theorem: exhibit φ : G/ker(f) ≅ im(f)
export function firstIso<A, B>(
  G: FinGroup<A>,
  H: FinGroup<B>,
  f: FinGroupMor<A, B>
): { cosets: A[][]; img: B[]; phi: (coset: A[]) => B } {
  const K = kernel(G, H, f);
  const cos = cosets(G, K);
  const img = image(G, f);
  const phi = (c: A[]) => f.run(c[0]!); // well-defined by homomorphism property
  return { cosets: cos, img, phi };
}