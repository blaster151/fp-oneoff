import { FiniteSet, Eq, mkFiniteSet } from "./Set";

export type Inl<A> = { tag:"inl"; a:A };
export type Inr<B> = { tag:"inr"; b:B };

export function coproduct<A,B>(Aset:FiniteSet<A>, Bset:FiniteSet<B>) {
  type S = Inl<A>|Inr<B>;
  const elems: S[] = [
    ...Aset.elems.map(a=>({tag:"inl", a} as Inl<A>)),
    ...Bset.elems.map(b=>({tag:"inr", b} as Inr<B>)),
  ];
  const eq: Eq<S> = (x,y)=>{
    if (x.tag!==y.tag) return false;
    return x.tag==="inl" ? Aset.eq(x.a,(y as Inl<A>).a) : Bset.eq((x as Inr<B>).b,(y as Inr<B>).b);
  };
  return mkFiniteSet(elems, eq);
}