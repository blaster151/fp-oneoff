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

// Enhanced quotient cosets function with better naming
export function quotientCosets<A>(G: FinGroup<A>, K: A[]): A[][] {
  return cosets(G, K);
}

// Check well-definedness: all elements in the coset should map to the same image
export function phiToImage<A, B>(
  f: FinGroupMor<A, B>, 
  ker: A[], 
  coset: A[]
): B {
  // Check well-definedness: all elements in the coset should map to the same image
  const images = coset.map(a => f.run(a));
  const firstImage = images[0];
  
  for (const img of images) {
    if (!f.dst.eq(img, firstImage)) {
      throw new Error(`Well-definedness violation: coset ${coset} maps to different images`);
    }
  }
  
  return firstImage;
}

export interface FirstIsoWitness {
  inj: boolean;  // injective
  surj: boolean; // surjective  
  homo: boolean; // homomorphism
  iso: boolean;  // isomorphism (inj && surj && homo)
}

export function firstIsoWitness<A, B>(
  G: FinGroup<A>, 
  H: FinGroup<B>, 
  f: FinGroupMor<A, B>
): FirstIsoWitness {
  const ker = kernel(G, H, f);
  const cosetList = quotientCosets(G, ker);
  const img = image(G, f);
  
  // Build the isomorphism φ: G/ker(f) → im(f)
  const phi = (coset: A[]): B => phiToImage(f, ker, coset);
  
  // Check injectivity of the original homomorphism f: G → H
  let inj = true;
  for (let i = 0; i < G.carrier.length; i++) {
    for (let j = i + 1; j < G.carrier.length; j++) {
      const a = G.carrier[i];
      const b = G.carrier[j];
      if (H.eq(f.run(a), f.run(b))) {
        inj = false;
        break;
      }
    }
    if (!inj) break;
  }
  
  // Check surjectivity of the original homomorphism f: G → H
  let surj = true;
  for (const hElement of H.carrier) {
    let hit = false;
    for (const gElement of G.carrier) {
      if (H.eq(f.run(gElement), hElement)) {
        hit = true;
        break;
      }
    }
    if (!hit) {
      surj = false;
      break;
    }
  }
  
  // Check homomorphism property of the original f: G → H
  let homo = true;
  for (const a of G.carrier) {
    for (const b of G.carrier) {
      const ab = G.op(a, b);
      const fa = f.run(a);
      const fb = f.run(b);
      const fab = f.run(ab);
      const fa_times_fb = H.op(fa, fb);
      
      if (!H.eq(fab, fa_times_fb)) {
        homo = false;
        break;
      }
    }
    if (!homo) break;
  }
  
  const iso = inj && surj && homo;
  
  return { inj, surj, homo, iso };
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
  const phi = (c: A[]) => phiToImage(f, K, c); // Use enhanced well-definedness check
  return { cosets: cos, img, phi };
}
