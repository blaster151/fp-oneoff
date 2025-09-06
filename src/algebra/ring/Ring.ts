export interface FiniteRing<A> {
  readonly elems: ReadonlyArray<A>;
  readonly add: (a:A,b:A)=>A;
  readonly mul: (a:A,b:A)=>A;
  readonly zero: A;
  readonly one: A;
  readonly neg: (a:A)=>A;
  readonly eq?: (x:A,y:A)=>boolean;
  readonly name?: string;
}

export const req = <A>(R: FiniteRing<A>) => R.eq ?? ((x,y)=>Object.is(x,y));

/** ℤ/nℤ (representatives 0..n-1) */
export function Zmod(n: number): FiniteRing<number> {
  if (!Number.isInteger(n) || n <= 0) throw new Error("Zmod: n must be positive integer");
  const elems = Array.from({length:n}, (_,i)=>i);
  const add  = (a:number,b:number)=> (a+b)%n;
  const mul  = (a:number,b:number)=> (a*b)%n;
  const neg  = (a:number)=> (n - (a % n)) % n;
  return { elems, add, mul, zero:0, one:1 % n, neg, name: `Z/${n}Z` };
}

/** Product ring R × S */
export function RProd<A,B>(R: FiniteRing<A>, S: FiniteRing<B>): FiniteRing<[A,B]> {
  const eqR = req(R), eqS = req(S);
  const elems: Array<[A,B]> = [];
  for (const a of R.elems) for (const b of S.elems) elems.push([a,b]);
  return {
    elems,
    add: ([a1,b1],[a2,b2]) => [R.add(a1,a2), S.add(b1,b2)],
    mul: ([a1,b1],[a2,b2]) => [R.mul(a1,a2), S.mul(b1,b2)],
    zero: [R.zero, S.zero],
    one:  [R.one,  S.one],
    neg:  ([a,b]) => [R.neg(a), S.neg(b)],
    eq: ([x1,y1],[x2,y2]) => eqR(x1,x2) && eqS(y1,y2),
    name: `(${R.name ?? 'R'})×(${S.name ?? 'S'})`,
  };
}