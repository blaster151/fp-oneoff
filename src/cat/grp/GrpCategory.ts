// src/cat/grp/GrpCategory.ts
import { Category } from "../core/Category";
import { FinGroup, FinGroupMor } from "./FinGrp";

export const Grp: Category<FinGroup<any>, FinGroupMor<any,any>> = {
  id: <A>(G: FinGroup<A>): FinGroupMor<A,A> => ({ 
    src: G, 
    dst: G, 
    run: x => x 
  }),
  
  compose: <A,B,C>(
    f: FinGroupMor<A,B>, 
    g: FinGroupMor<B,C>
  ): FinGroupMor<A,C> => ({
    src: f.src,
    dst: g.dst,
    run: (a: A) => g.run(f.run(a))
  }),
  
  eqObj: <A>(G1: FinGroup<A>, G2: FinGroup<A>) => 
    G1.carrier.length === G2.carrier.length &&
    G1.carrier.every(a => G2.carrier.some(b => G1.eq(a, b))),
    
  eqMor: <A,B>(f: FinGroupMor<A,B>, g: FinGroupMor<A,B>) => {
    if (f.src !== g.src || f.dst !== g.dst) return false;
    return f.src.carrier.every(a => f.dst.eq(f.run(a), g.run(a)));
  },
  
  laws: {
    leftIdentity: <A>(G: FinGroup<A>, f: FinGroupMor<A,A>) => {
      const id = Grp.id(G);
      const comp = Grp.compose(id, f);
      return Grp.eqMor!(comp, f);
    },
    
    rightIdentity: <A>(G: FinGroup<A>, f: FinGroupMor<A,A>) => {
      const id = Grp.id(G);
      const comp = Grp.compose(f, id);
      return Grp.eqMor!(comp, f);
    },
    
    associativity: <A,B,C,D>(
      f: FinGroupMor<A,B>, 
      g: FinGroupMor<B,C>, 
      h: FinGroupMor<C,D>
    ) => {
      const left = Grp.compose(Grp.compose(f, g), h);
      const right = Grp.compose(f, Grp.compose(g, h));
      return Grp.eqMor!(left, right);
    }
  }
};