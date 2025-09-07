import { Category } from "../core/Category";

// Simple category of sets and functions
export type SetObj<A> = Set<A>;
export type SetMor<A, B> = (a: A) => B;

export const SetCategory: Category<SetObj<any>, SetMor<any, any>> = {
  id: <A>(_: SetObj<A>): SetMor<A, A> => (a: A) => a,
  compose: <A, B, C>(g: SetMor<B, C>, f: SetMor<A, B>): SetMor<A, C> => 
    (a: A) => g(f(a)),
  eqMor: <A, B>(f: SetMor<A, B>, g: SetMor<A, B>): boolean => {
    // Extensional equality is undecidable in general, so we use reference equality
    // In practice, this would need sample-based testing for finite domains
    return f === g;
  }
};