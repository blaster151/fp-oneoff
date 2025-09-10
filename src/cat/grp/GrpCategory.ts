import { Category } from "../core/Category";
import { FinGroup, FinGroupMor } from "./FinGrp";

/** The category of (finite) groups and homomorphisms. */
export const Grp: Category<FinGroup<any>, FinGroupMor<any, any>> = {
  id: <A>(G: FinGroup<A>): FinGroupMor<A, A> => ({ src: G, dst: G, run: x => x }),

  compose: <A, B, C>(
    f: FinGroupMor<A, B>,
    g: FinGroupMor<B, C>
  ): FinGroupMor<A, C> => ({
    src: f.src,
    dst: g.dst,
    run: (a: A) => g.run(f.run(a)),
  }),
};