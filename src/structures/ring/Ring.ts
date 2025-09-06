// Finite rings (possibly noncommutative). Morphisms live in RingHom.ts.
import type { Eq } from '../../types/eq.js';
export type RingEq<A> = Eq<A>;

export type FiniteRing<A> = {
  elems: A[];
  eq: RingEq<A>;

  // additive abelian group
  add: (a:A,b:A)=>A;
  zero: A;
  neg: (a:A)=>A;

  // multiplicative monoid (with 1)
  mul: (a:A,b:A)=>A;
  one: A;

  // metadata
  comm: boolean; // true if multiplication is commutative
  show?: (a:A)=>string; // optional debug printer
};

/** Basic ring law checks on a finite carrier (for tests & sanity). */
export function checkRingLaws<A>(R: FiniteRing<A>): { ok: boolean; msg?: string } {
  const E = R.elems;
  const eq = R.eq;

  // + is associative, commutative; 0 is identity; neg is inverse
  for (const a of E) for (const b of E) for (const c of E) {
    if (!eq(R.add(R.add(a,b),c), R.add(a,R.add(b,c)))) return { ok:false, msg:"+ not associative" };
  }
  for (const a of E) for (const b of E) {
    if (!eq(R.add(a,b), R.add(b,a))) return { ok:false, msg:"+ not commutative" };
  }
  for (const a of E) {
    if (!eq(R.add(a,R.zero), a) || !eq(R.add(R.zero, a), a)) return { ok:false, msg:"0 not additive identity" };
    if (!eq(R.add(a,R.neg(a)), R.zero)) return { ok:false, msg:"neg not additive inverse" };
  }

  // * is associative; 1 is identity
  for (const a of E) for (const b of E) for (const c of E) {
    if (!eq(R.mul(R.mul(a,b),c), R.mul(a,R.mul(b,c)))) return { ok:false, msg:"* not associative" };
  }
  for (const a of E) {
    if (!eq(R.mul(a,R.one), a) || !eq(R.mul(R.one, a), a)) return { ok:false, msg:"1 not multiplicative identity" };
  }

  // distributivity
  for (const a of E) for (const b of E) for (const c of E) {
    if (!eq(R.mul(a,R.add(b,c)), R.add(R.mul(a,b), R.mul(a,c)))) return { ok:false, msg:"left distributivity fails" };
    if (!eq(R.mul(R.add(a,b),c), R.add(R.mul(a,c), R.mul(b,c)))) return { ok:false, msg:"right distributivity fails" };
  }

  return { ok:true };
}

/** ℤ/nℤ ring (commutative). */
export function ZnRing(n: number): FiniteRing<number> {
  if (n<=0 || !Number.isInteger(n)) throw new Error("ZnRing: n must be positive integer");
  const elems = Array.from({length:n}, (_,i)=>i);
  const mod = (x:number)=> ((x % n)+n)%n;
  const eq = (a:number,b:number)=> a===b;
  const add = (a:number,b:number)=> mod(a+b);
  const neg = (a:number)=> mod(-a);
  const mul = (a:number,b:number)=> mod(a*b);
  const zero = 0, one = 1 % n;
  return { elems, eq, add, zero, neg, mul, one, comm:true, show:(x)=>`${x} (mod ${n})` };
}

/** 2×2 matrices over ℤ/nℤ (generally noncommutative). */
export type M2 = { a:number,b:number,c:number,d:number };

export function M2ZnRing(n: number): FiniteRing<M2> {
  const Z = ZnRing(n);
  const elems: M2[] = [];
  for (const a of Z.elems) for (const b of Z.elems)
  for (const c of Z.elems) for (const d of Z.elems) elems.push({a,b,c,d});
  const eq = (x:M2,y:M2)=> x.a===y.a && x.b===y.b && x.c===y.c && x.d===y.d;
  const add = (x:M2,y:M2)=> ({a:Z.add(x.a,y.a), b:Z.add(x.b,y.b), c:Z.add(x.c,y.c), d:Z.add(x.d,y.d)});
  const neg = (x:M2)=> ({a:Z.neg(x.a), b:Z.neg(x.b), c:Z.neg(x.c), d:Z.neg(x.d)});
  const mul = (x:M2,y:M2)=> ({
    a: Z.add(Z.mul(x.a,y.a), Z.mul(x.b,y.c)),
    b: Z.add(Z.mul(x.a,y.b), Z.mul(x.b,y.d)),
    c: Z.add(Z.mul(x.c,y.a), Z.mul(x.d,y.c)),
    d: Z.add(Z.mul(x.c,y.b), Z.mul(x.d,y.d)),
  });
  const zero = {a:0,b:0,c:0,d:0};
  const one  = {a:1%n, b:0, c:0, d:1%n};
  const show = (m:M2)=>`[[${m.a},${m.b}],[${m.c},${m.d}]] (mod ${n})`;
  return { elems, eq, add, zero, neg, mul, one, comm:false, show };
}