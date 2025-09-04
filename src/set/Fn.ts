import { FiniteSet, Eq } from "./Set";

export type Fn<A,B> = { dom: FiniteSet<A>, cod: FiniteSet<B>, f:(a:A)=>B };

export function id<A>(S: FiniteSet<A>): Fn<A,A> {
  return { dom: S, cod: S, f:(a)=>a };
}

export function comp<A,B,C>(g: Fn<B,C>, f: Fn<A,B>): Fn<A,C> {
  if (f.cod !== g.dom) {
    // loose check; in this project we typically keep same object identity
  }
  return { dom: f.dom, cod: g.cod, f:(a)=>g.f(f.f(a)) };
}

export function equalByGraph<A,B>(f:Fn<A,B>, g:Fn<A,B>): boolean {
  for (const a of f.dom.elems) if (!f.cod.eq(f.f(a), g.f(a))) return false;
  return true;
}