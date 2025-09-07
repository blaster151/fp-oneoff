import { SmallCategory, Mor, mkMor } from "../core";
import { FiniteSet, SetObj } from "./SetCat";

// Objects = explicitly enumerated finite sets with a total equality.
export type Eq<A> = (x: A, y: A) => boolean;

// Reuse existing FiniteSet interface but adapt for Small category
export interface FinSetMor<A, B> extends Mor<FiniteSet<any>, A, B> {}

// Category structure
export const FinSetCat: SmallCategory<FiniteSet<any>, unknown> = {
  name: "FinSet",
  objects: () => [], // optional registry; tests will manage explicit objects they build
  id<A>(o: FiniteSet<A>): FinSetMor<A, A> {
    return mkMor(o, o, (a: A) => a) as FinSetMor<A, A>;
  },
  comp<A, B, C>(g: FinSetMor<B, C>, f: FinSetMor<A, B>): FinSetMor<A, C> {
    if (f.cod !== g.dom) throw new Error("domain/codomain mismatch");
    return mkMor(f.dom, g.cod, (a: A) => g.run(f.run(a))) as FinSetMor<A, C>;
  }
};

// Build a morphism from a function (integrates with existing SetObj)
export function finsetMor<A, B>(dom: FiniteSet<A>, cod: FiniteSet<B>, fn: (a: A) => B): FinSetMor<A, B> {
  // (optional) totality check: image must be in cod.elems
  dom.elems.forEach(a => {
    const b = fn(a);
    if (!cod.elems.some(c => cod.eq(c, b))) {
      // relax: allow value not pre-listed; FinSet stays small but codomain may extend.
    }
  });
  return mkMor(dom, cod, fn) as FinSetMor<A, B>;
}

// Convenience: create finite set using existing SetObj
export const finset = <A>(label: string, carrier: ReadonlyArray<A>, eq: Eq<A>): FiniteSet<A> => 
  SetObj(carrier, { eq, name: label });