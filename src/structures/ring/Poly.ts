import { FiniteRing, ZnRing } from "./Ring";

/** Dense polynomial with coefficients in Z/n, stored as length-(d+1) array (mod x^{d+1}). */
export type Poly = { coeffs: number[]; n: number; d: number };

function modn(n:number,x:number){ return ((x % n)+n)%n; }
function trim(a:number[], n:number, d:number): number[] {
  const out = a.slice(0,d+1).map(x=>modn(n,x));
  return out;
}

export function PolyRing(n:number, d:number): FiniteRing<Poly> {
  const Zn = ZnRing(n);
  const elems: Poly[] = [];

  // enumerate all polynomials up to degree d (finite)
  const all = (function gen(i:number, acc:number[]): void {
    if (i===d+1) { elems.push({ coeffs: acc.slice(), n, d }); return; }
    for (let c=0;c<n;c++){ acc[i]=c; gen(i+1, acc); }
  })(0, new Array(d+1).fill(0));

  const eq = (p:Poly,q:Poly)=> p.n===q.n && p.d===q.d && p.coeffs.every((c,i)=>c===q.coeffs[i]);
  const zero = { coeffs: new Array(d+1).fill(0), n, d };
  const one  = { coeffs: [1, ...new Array(d).fill(0)], n, d };

  const add = (p:Poly,q:Poly): Poly => {
    const r = new Array(d+1).fill(0).map((_,i)=> modn(n, p.coeffs[i]! + q.coeffs[i]!));
    return { coeffs: r, n, d };
  };
  const neg = (p:Poly): Poly => ({ coeffs: p.coeffs.map(c=>modn(n,-c)), n, d });

  const mul = (p:Poly,q:Poly): Poly => {
    const r = new Array(d+1).fill(0);
    for (let i=0;i<=d;i++) for (let j=0;j<=d;j++){
      const k = i+j;
      if (k<=d) r[k] = modn(n, r[k]! + p.coeffs[i]! * q.coeffs[j]!);
    }
    return { coeffs: r, n, d };
  };

  const show = (p:Poly)=> p.coeffs
    .map((c,i)=> ({c,i}))
    .filter(({c})=>c!==0)
    .map(({c,i})=> i===0? `${c}` : i===1? `${c}x` : `${c}x^${i}`)
    .join(" + ") || "0";

  return { elems, eq, add, zero, neg, mul, one, comm:true, show:(p)=>show(p) };
}

/** Evaluate polynomial at a ∈ Z/n. */
export function evalPoly(p: Poly, a: number): number {
  let acc = 0, pow = 1;
  for (let i=0;i<p.coeffs.length;i++){
    acc = modn(p.n, acc + (p.coeffs[i] ?? 0)*pow);
    pow = modn(p.n, pow * a);
  }
  return acc;
}

/** Ring hom: eval at a ∈ Z/n gives hom Z/n[x]/(x^{d+1}) → Z/n. */
export function evalHom(n:number, d:number, a:number){
  const R = PolyRing(n,d); const Zn = ZnRing(n);
  return {
    source: R, target: Zn,
    f: (p: Poly)=> evalPoly(p, a)
  };
}