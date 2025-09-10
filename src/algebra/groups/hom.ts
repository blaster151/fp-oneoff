import { FiniteGroup, containsByEq } from "./core";

export type Hom<G, H> = {
  src: FiniteGroup<G>;
  dst: FiniteGroup<H>;
  map: (g: G) => H;
};

// Kernel, Image
export function kernel<G, H>(f: Hom<G, H>): G[] {
  const { src: G, dst: H } = f;
  return G.elems.filter((g: G) => H.eq(f.map(g), H.id));
}

export function image<G, H>(f: Hom<G, H>): H[] {
  const { src: G, dst: H } = f;
  const img: H[] = [];
  for (const g of G.elems) {
    const h = f.map(g);
    if (!containsByEq(img, h, H.eq)) img.push(h);
  }
  return img;
}

// Cosets and quotient by a normal subgroup K (as a list of cosets)
export function leftCoset<G>(G: FiniteGroup<G>, K: G[], g: G): G[] {
  const coset: G[] = [];
  for (const k of K) coset.push(G.op(g, k));
  // uniq by equality
  const uniq: G[] = [];
  for (const x of coset) {
    if (!uniq.some(y => G.eq(x, y))) uniq.push(x);
  }
  return uniq;
}

export function quotientCosets<G>(G: FiniteGroup<G>, K: G[]): G[][] {
  const seen: G[] = [];
  const cosets: G[][] = [];
  for (const g of G.elems) {
    if (!seen.some(s => G.eq(s, g))) {
      const C = leftCoset(G, K, g);
      cosets.push(C);
      for (const x of C) if (!seen.some(s => G.eq(s, x))) seen.push(x);
    }
  }
  return cosets;
}

// Natural map φ: G/K → im f, presented as a representative-respecting function
export function phiToImage<G, H>(
  f: Hom<G, H>,
  _K: G[],               // kernel(f) — not needed by the check here
  coset: G[]             // a coset (representative list)
): H {
  const { dst: H } = f;
  let val: H | undefined = undefined;
  for (const g of coset) {
    const h = f.map(g);
    if (val === undefined) val = h;
    else if (!H.eq(val, h)) {
      throw new Error("phi not well-defined: coset members mapped to different values");
    }
  }
  return val as H;
}
