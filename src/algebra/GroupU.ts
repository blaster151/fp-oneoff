import { UniverseId, UniverseOps, Small } from "../size/Universe";
import { SetU, finiteSet } from "../core/SetU";

export type Group<U extends UniverseId, A> = {
  readonly Uops: UniverseOps<U>;
  readonly carrier: SetU<U, A>;
  readonly op: (x: A, y: A) => A;
  readonly e: A;
  readonly inv: (x: A) => A;
  // optional witnesses
  readonly laws?: {
    assoc: (x:A,y:A,z:A)=>boolean;
    id: (x:A)=>boolean;
    inv: (x:A)=>boolean;
  };
};

export type GroupHom<U extends UniverseId, A, B> = {
  readonly Uops: UniverseOps<U>;
  readonly dom: Group<U, A>;
  readonly cod: Group<U, B>;
  readonly map: (a: A) => B;
  // homomorphism law witness (optional)
  readonly preservesOp?: (x:A,y:A)=>boolean;
};

// helpers
export const isHom = <U extends UniverseId, A, B>(h: GroupHom<U, A, B>, x:A, y:A) =>
  h.map(h.dom.op(x,y)) === h.cod.op(h.map(x), h.map(y));

// build finite examples quickly
export const Zmod = <U extends UniverseId>(Uops: UniverseOps<U>, n: number): Group<U, number> => {
  const xs = Array.from({length:n}, (_,i)=>i);
  const add = (a:number,b:number)=> (a+b)%n;
  const inv = (a:number)=> (n-a)%n;
  return {
    Uops,
    carrier: finiteSet(Uops, xs),
    op: add,
    e: 0,
    inv,
  };
};
