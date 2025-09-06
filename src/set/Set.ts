import { Eq } from '../types/eq.js';

// Re-export for backward compatibility
export { Eq };

export type FiniteSet<A> = {
  elems: A[];
  eq: Eq<A>;
};

export function mkFiniteSet<A>(elems: A[], eq: Eq<A>): FiniteSet<A> {
  // dedupe by eq
  const out: A[] = [];
  const has = (a:A)=>out.some(b=>eq(a,b));
  for (const a of elems) if (!has(a)) out.push(a);
  return { elems: out, eq };
}

export function member<A>(S: FiniteSet<A>, a: A) {
  return S.elems.some(x=>S.eq(x,a));
}

export function image<A,B>(S: FiniteSet<A>, f:(a:A)=>B, eqB:Eq<B>): FiniteSet<B> {
  return mkFiniteSet(S.elems.map(f), eqB);
}

export function preimage<A,B>(S: FiniteSet<A>, f:(a:A)=>B, T: FiniteSet<B>) {
  return mkFiniteSet(S.elems.filter(a=>member(T,f(a))), S.eq);
}