import { FiniteSet, Eq, mkFiniteSet } from "./Set";

export function product<A,B>(Aset:FiniteSet<A>, Bset:FiniteSet<B>) {
  type P = { a:A; b:B };
  const elems: P[] = [];
  for (const a of Aset.elems) for (const b of Bset.elems) elems.push({a,b});
  const eq: Eq<P> = (x,y)=> Aset.eq(x.a,y.a) && Bset.eq(x.b,y.b);
  return mkFiniteSet(elems, eq);
}