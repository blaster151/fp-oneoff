// Traceability: Smith §2.8 – First Isomorphism Theorem: G/ker(f) ≅ im(f)

import { FiniteGroup, eqOf } from "./Group";
import { GroupHom, hom, compose, analyzeHom } from "./Hom";

// --- Kernel and image ---

export function kernel<A, B>(f: GroupHom<unknown, unknown, A, B>): {
  K: FiniteGroup<A>;
  include: GroupHom<unknown, unknown, A, A>;
} {
  const G = f.source;
  const H = f.target;
  const eqH = eqOf(H);
  
  const kernelElems = G.elems.filter(a => eqH(f.map(a), H.id));
  
  const K: FiniteGroup<A> = {
    elems: kernelElems,
    eq: G.eq,
    op: G.op,
    id: G.id,
    inv: G.inv,
    name: `ker(${f.name || 'f'})`
  };
  
  const include: GroupHom<unknown, unknown, A, A> = hom(K, G, (a: A) => a, "ι");
  
  return { K, include };
}

export function image<A, B>(f: GroupHom<unknown, unknown, A, B>): {
  im: FiniteGroup<B>;
  include: GroupHom<unknown, unknown, B, B>;
} {
  const H = f.target;
  const eqH = eqOf(H);
  
  // Get unique image elements
  const imageElems = f.source.elems.map(f.map);
  const unique = imageElems.filter((b, i) => 
    imageElems.findIndex(bb => eqH(bb, b)) === i
  );
  
  const im: FiniteGroup<B> = {
    elems: unique,
    eq: H.eq,
    op: H.op,
    id: H.id,
    inv: H.inv,
    name: `im(${f.name || 'f'})`
  };
  
  const include: GroupHom<unknown, unknown, B, B> = hom(im, H, (b: B) => b, "ι");
  
  return { im, include };
}

// --- Quotient groups ---

export type Coset<A> = { rep: A; members: A[] };

export function quotientGroup<A>(G: FiniteGroup<A>, K: FiniteGroup<A>): FiniteGroup<Coset<A>> {
  const eqG = eqOf(G);
  
  // Partition G.elems into cosets gK
  const seen: boolean[] = G.elems.map(() => false);
  const cosets: Coset<A>[] = [];
  
  const idxOf = (x: A) => G.elems.findIndex(y => eqG(x, y));
  
  for (let i = 0; i < G.elems.length; i++) {
    if (seen[i]) continue;
    const g = G.elems[i];
    
    // members = { g * k | k in K }
    const members: A[] = [];
    for (const x of G.elems) {
      if (K.elems.some(k => eqG(x, G.op(g, k)))) {
        members.push(x);
        const j = idxOf(x);
        if (j >= 0) seen[j] = true;
      }
    }
    cosets.push({ rep: g, members });
  }
  
  const eqCoset = (a: Coset<A>, b: Coset<A>) =>
    a.members.length === b.members.length &&
    a.members.every(m => b.members.some(n => eqG(m, n)));
  
  const opCoset = (a: Coset<A>, b: Coset<A>): Coset<A> => {
    const rep = G.op(a.rep, b.rep);
    const belong = cosets.find(c => c.members.some(m => eqG(m, rep)));
    if (!belong) throw new Error("Internal error: missing coset.");
    return belong;
  };
  
  const eCoset = cosets.find(c => c.members.some(m => eqG(m, G.id)))!;
  const invCoset = (c: Coset<A>) => {
    const repInv = G.inv(c.rep);
    const belong = cosets.find(k => k.members.some(m => eqG(m, repInv)))!;
    return belong;
  };
  
  return {
    elems: cosets,
    eq: eqCoset,
    op: opCoset,
    id: eCoset,
    inv: invCoset,
    name: `${G.name || 'G'}/${K.name || 'K'}`
  };
}

// --- First Isomorphism Theorem: G/ker(f) ≅ im(f) ---

export interface GroupIso<A, B> {
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
  to: GroupHom<unknown, unknown, A, B>;
  from: GroupHom<unknown, unknown, B, A>;
  leftInverse: () => boolean;  // from∘to = id
  rightInverse: () => boolean; // to∘from = id
}

export function firstIsomorphism<A, B>(f: GroupHom<unknown, unknown, A, B>): {
  quotient: FiniteGroup<Coset<A>>;
  imageGrp: FiniteGroup<B>;
  iso: GroupIso<Coset<A>, B>;
} {
  const { K } = kernel(f);
  const quotient = quotientGroup(f.source, K);
  const { im: imageGrp } = image(f);
  
  // φ([g]) = f(g)
  const to = hom(quotient, imageGrp, (c: Coset<A>) => f.map(c.rep), "φ");
  
  // For finite groups, construct a section s : im(f) -> quotient
  const from = hom(imageGrp, quotient, (b: B) => {
    // Find any coset containing an element that maps to b
    const eqH = eqOf(f.target);
    const coset = quotient.elems.find(c => 
      c.members.some(a => eqH(f.map(a), b))
    );
    if (!coset) throw new Error("Internal error: element not in image.");
    return coset;
  }, "s");
  
  const leftInverse = () => {
    const composed = compose(from, to);
    const analyzed = analyzeHom(composed);
    const eqQuotient = eqOf(quotient);
    
    return quotient.elems.every(c => {
      const back = analyzed.map(c);
      return eqQuotient(back, c);
    });
  };
  
  const rightInverse = () => {
    const composed = compose(to, from);
    const analyzed = analyzeHom(composed);
    const eqH = eqOf(f.target);
    
    return imageGrp.elems.every(b => {
      const forth = analyzed.map(b);
      return eqH(forth, b);
    });
  };
  
  const iso: GroupIso<Coset<A>, B> = {
    source: quotient,
    target: imageGrp,
    to,
    from,
    leftInverse,
    rightInverse
  };
  
  return { quotient, imageGrp, iso };
}