import { FiniteRing, req, Zmod } from "./Ring";

// A (unital) ring hom: preserves +, *, 0, 1.
export interface RingHom<A,B> {
  readonly source: FiniteRing<A>;
  readonly target: FiniteRing<B>;
  readonly map: (a:A)=>B;
  readonly name?: string;
  witnesses?: RingWitnesses<A,B>;
}

export interface RingWitnesses<A,B> {
  isHom: boolean;                 // preserves add,mul,0,1
  injectiveUnderlying: boolean;   // injective as a function of sets
  surjectiveUnderlying: boolean;  // surjective as a function of sets
  isMono: boolean;                // left-cancellable (checked by probing)
  isEpi: boolean;                 // right-cancellable (checked by probing)
  isIso: boolean;                 // has two-sided inverse hom (found by search)
  leftInverse?: RingHom<B,A>;
  rightInverse?: RingHom<B,A>;
}

export function ringHom<A,B>(R: FiniteRing<A>, S: FiniteRing<B>, map:(a:A)=>B, name?: string): RingHom<A,B> {
  return analyzeRingHom({ source: R, target: S, map, name });
}

export function isRingHom<A,B>(f: RingHom<A,B>): boolean {
  const R = f.source, S = f.target, eqS = req(S);
  // 0,1
  if (!eqS(f.map(R.zero), S.zero)) return false;
  if (!eqS(f.map(R.one),  S.one))  return false;
  // add, mul
  for (const a of R.elems) for (const b of R.elems) {
    const addOK = eqS(f.map(R.add(a,b)), S.add(f.map(a), f.map(b)));
    if (!addOK) return false;
    const mulOK = eqS(f.map(R.mul(a,b)), S.mul(f.map(a), f.map(b)));
    if (!mulOK) return false;
  }
  return true;
}

// ---- utilities on finite carriers ----
function equalPointwise<X,Y>(Dom: ReadonlyArray<X>, eq: (y1:Y,y2:Y)=>boolean, f:(x:X)=>Y, g:(x:X)=>Y) {
  for (const x of Dom) if (!eq(f(x), g(x))) return false;
  return true;
}
function allFunctions<X,Y>(Dom: ReadonlyArray<X>, Cod: ReadonlyArray<Y>): Array<(x:X)=>Y> {
  const n = Dom.length, m = Cod.length;
  if (n === 0) return [(_x:X)=>Cod[0]];
  const out: Array<(x:X)=>Y> = [];
  const idx = Array(n).fill(0);
  const total = m ** n;
  for (let k=0;k<total;k++){
    const tbl = idx.map(i => Cod[i]);
    const f = (x:X)=> tbl[Dom.indexOf(x as any)];
    out.push(f);
    for (let i=0;i<n;i++){ idx[i]++; if (idx[i]<m) break; idx[i]=0; }
  }
  return out;
}
function allRingHoms<A,B>(R: FiniteRing<A>, S: FiniteRing<B>): Array<RingHom<A,B>> {
  const fs = allFunctions(R.elems, S.elems);
  const out: Array<RingHom<A,B>> = [];
  for (const f of fs) {
    const cand: RingHom<A,B> = { source: R, target: S, map: f };
    if (isRingHom(cand)) out.push(cand);
  }
  // dedupe
  const eqS = req(S);
  return out.filter((h,i)=> out.findIndex(k => equalPointwise(R.elems, eqS, h.map, k.map))===i);
}

export function analyzeRingHom<A,B>(f: RingHom<A,B>): RingHom<A,B> {
  const R=f.source, S=f.target;
  const eqR = req(R), eqS = req(S);

  const isHom = isRingHom(f);

  // injective/surjective underlying
  let injective = true;
  for (let i=0;i<R.elems.length;i++) for (let j=i+1;j<R.elems.length;j++) {
    if (eqS(f.map(R.elems[i]), f.map(R.elems[j]))) { injective = false; i=R.elems.length; break; }
  }
  const image: B[] = [];
  for (const a of R.elems) { const y=f.map(a); if (!image.some(z=>eqS(z,y))) image.push(y); }
  const surjective = S.elems.every(b => image.some(y => eqS(y, b)));

  // iso / inverse search
  let leftInv: RingHom<B,A> | undefined;
  let rightInv: RingHom<B,A> | undefined;
  let isIso = false;

  const homsSG = allRingHoms(S, R);
  for (const g of homsSG) {
    const gofId = equalPointwise(R.elems, eqR, (x:A)=> g.map(f.map(x)), (x:A)=> x);
    const fogId = equalPointwise(S.elems, eqS, (y:B)=> f.map(g.map(y as any)), (y:B)=> y);
    if (gofId) leftInv = g;
    if (fogId) rightInv = g;
    if (gofId && fogId) { isIso = true; break; }
  }

  // cancellability (probe small domains/codomains)
  // we use Z/2Z, Z/3Z, Z/4Z as typical small test rings
  const probes = [2,3,4].map(n => Zmod(n));

  // mono: for all g,h: J->R, f∘g = f∘h ⇒ g=h
  let isMono = true;
  outerMono:
  for (const J of probes) {
    const homsJR = allRingHoms(J, R);
    for (let i=0;i<homsJR.length;i++) for (let j=i+1;j<homsJR.length;j++) {
      const g = homsJR[i];
      const h = homsJR[j];
      if (g === undefined || h === undefined) throw new Error("Array access out of bounds");
      const fog = (x:any)=> f.map(g.map(x));
      const foh = (x:any)=> f.map(h.map(x));
      if (equalPointwise(J.elems, eqS, fog, foh) && !equalPointwise(J.elems, eqR, g.map, h.map)) { isMono = false; break outerMono; }
    }
  }

  // epi: for all g,h: S->K, g∘f = h∘f ⇒ g=h
  let isEpi = true;
  outerEpi:
  for (const K of probes) {
    const homsSK = allRingHoms(S, K);
    for (let i=0;i<homsSK.length;i++) for (let j=i+1;j<homsSK.length;j++) {
      const g = homsSK[i];
      const h = homsSK[j];
      if (g === undefined || h === undefined) throw new Error("Array access out of bounds");
      const gof = (x:any)=> g.map(f.map(x));
      const hof = (x:any)=> h.map(f.map(x));
      if (equalPointwise(R.elems, req(K), gof, hof) && !equalPointwise(S.elems, req(K), g.map, h.map)) { isEpi = false; break outerEpi; }
    }
  }

  f.witnesses = {
    isHom,
    injectiveUnderlying: injective,
    surjectiveUnderlying: surjective,
    isMono,
    isEpi,
    isIso,
    leftInverse: leftInv,
    rightInverse: rightInv
  };
  return f;
}