import { LargeCategory, Mor, mkMor } from "../core";

// Large: we do not enumerate objects. We just carry a witness of "type A".
export interface TypeOf<A> { readonly tag: symbol; }
export const typeOf = <A>(): TypeOf<A> => ({ tag: Symbol() });

// Object in Set = a (virtual) class of all values of type A.
export interface SetObj<A> {
  readonly name: string;
  readonly T: TypeOf<A>;
}

export const setObj = <A>(name: string): SetObj<A> => ({ name, T: typeOf<A>() });

export type SetMor<A, B> = Mor<SetObj<any>, A, B>;

export const SetCat: LargeCategory<SetObj<any>> = {
  name: "Set",
  id<A>(o: SetObj<A>): SetMor<A, A> {
    return mkMor(o, o, (a: A) => a) as SetMor<A, A>;
  },
  comp<A, B, C>(g: SetMor<B, C>, f: SetMor<A, B>): SetMor<A, C> {
    if (f.cod !== g.dom) throw new Error("domain/codomain mismatch");
    return mkMor(f.dom, g.cod, (a: A) => g.run(f.run(a))) as SetMor<A, C>;
  }
};

// Construct a function in Set
export const setMor = <A, B>(dom: SetObj<A>, cod: SetObj<B>, f: (a: A) => B): SetMor<A, B> =>
  mkMor(dom, cod, f) as SetMor<A, B>;