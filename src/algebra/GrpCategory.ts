import { UniverseId, UniverseOps } from "../size/Universe";
import { Category } from "../core/Category";
import { Group, GroupHom, isHom } from "./GroupU";
import { SetU, finiteSet } from "../core/SetU";

export const GrpCategory = <U extends UniverseId, A, B>(Uops: UniverseOps<U>) => {
  type G = Group<U, any>;
  type H = GroupHom<U, any, any>;

  const Ob: SetU<U, G> = finiteSet(Uops, [] as G[]); // start empty; tests will build concrete cats

  // For a structured demo we provide "local categories" per chosen finite set of groups.
  const makeCategory = (objects: G[]): Category<U, G, H> => ({
    Uops,
    Ob: finiteSet(Uops, objects),
    hom: (G1, G2) => {
      // For finite groups we can enumerate all total maps and keep homs.
      const xs = (G1.carrier.carrier.value as any[]).slice();
      const ys = (G2.carrier.carrier.value as any[]).slice();
      const allFns: H[] = []; // enumerate naively for tests (Cartesian product ys^xs)
      // For small demo, restrict to maps determined by images of generators—left to tests.
      return finiteSet(Uops, allFns);
    },
    id: (G) => ({
      Uops,
      dom: G, cod: G,
      map: (x:any)=>x,
      preservesOp: (x:any,y:any)=>true,
    }),
    comp: (g: H, f: H) => ({
      Uops, dom: f.dom, cod: g.cod,
      map: (x:any)=> g.map(f.map(x)),
      preservesOp: (x:any,y:any)=> isHom(f,x,y) && isHom(g,f.map(x),f.map(y))
    }),
  });

  return { makeCategory };
};
