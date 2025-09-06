import { FiniteRing } from "./Ring";
import { Ideal, idealGeneratedBy, isPrimeIdealComm } from "./Ideal";

/** Enumerate all ideals by saturating from every subset of generators up to a small bound. */
export function enumerateIdeals<A>(R: FiniteRing<A>, maxGens = 2): Ideal<A>[] {
  if (!R.comm) throw new Error("Spec: only commutative in this toy");
  const xs = R.elems;
  const seen: Ideal<A>[] = [];
  const eqI = (I:Ideal<A>, J:Ideal<A>) =>
    I.elems.length===J.elems.length &&
    I.elems.every(a=> J.elems.some(b=>R.eq(a,b)));

  // include (0) and (1)
  const I0 = idealGeneratedBy(R, [R.zero]);
  const I1 = idealGeneratedBy(R, [R.one]);
  seen.push(I0);
  if (!eqI(I1,I0)) seen.push(I1);

  // single generators
  for (const a of xs) {
    const I = idealGeneratedBy(R, [a]);
    if (!seen.some(J=>eqI(I,J))) seen.push(I);
  }
  if (maxGens>=2){
    // pairs of generators (tiny)
    for (let i=0;i<xs.length;i++) for (let j=i+1;j<xs.length;j++){
      const I = idealGeneratedBy(R, [xs[i]!, xs[j]!]);
      if (!seen.some(J=>eqI(I,J))) seen.push(I);
    }
  }
  return seen;
}

export type Prime<A> = Ideal<A> & { prime:true };

/** Spec(R): all prime ideals (toy enumeration). */
export function spec<A>(R: FiniteRing<A>): Prime<A>[] {
  const Is = enumerateIdeals(R, 2);
  return Is.filter(I=> isPrimeIdealComm(I)).map(I=> Object.assign({}, I, { prime:true as const }));
}

/** Inclusion I ⊆ J ? */
function incl<A>(R: FiniteRing<A>, I: Ideal<A>, J: Ideal<A>): boolean {
  return I.elems.every(a=> J.elems.some(b=> R.eq(a,b)));
}

/** Closed sets: V(I) = { p ∈ Spec R | I ⊆ p }. */
export function V<A>(R: FiniteRing<A>, I: Ideal<A>, primes?: Prime<A>[]): Prime<A>[] {
  const P = primes ?? spec(R);
  return P.filter(p => incl(R, I, p));
}

/** Basic open: D(a) = Spec R \ V((a)). */
export function D<A>(R: FiniteRing<A>, a: A, primes?: Prime<A>[]): Prime<A>[] {
  const I = idealGeneratedBy(R, [a]);
  const Vset = V(R, I, primes);
  const P = primes ?? spec(R);
  const key = (p:Prime<A>) => JSON.stringify(p.elems.map((x:any)=>x));
  const bad = new Set(Vset.map(key));
  return P.filter(p => !bad.has(key(p)));
}

/** Closure of subset S of Spec(R): cl(S) = V( ⋂_{p∈S} p ). On finite rings, intersection is elementwise. */
export function closure<A>(R: FiniteRing<A>, subset: Prime<A>[], primes?: Prime<A>[]): Prime<A>[] {
  if (subset.length===0) return V(R, idealGeneratedBy(R,[R.one]), primes); // V(1)=∅
  // intersection of ideals: elements in all
  const interElems = R.elems.filter(a => subset.every(p => p.elems.some(b=>R.eq(a,b))));
  const Icap = { ring:R, elems: interElems };
  return V(R, Icap as any, primes);
}