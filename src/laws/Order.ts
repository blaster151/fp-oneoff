import type { Eq, Law } from "./Witness";
import type { Poset } from "../order/Poset";
import type { CompleteLattice } from "../order/Lattice";
import { lfp } from "../order/Lattice";

export function posetLaws<A>(P: Poset<A>): Law<{P:Poset<A>}>[] {
  return [
    { name: "reflexive", check: ({P})=> P.elems.every(a=> P.leq(a,a)) },
    { name: "antisymmetric", check: ({P})=> P.elems.every(a=> P.elems.every(b=> !(P.leq(a,b) && P.leq(b,a)) || P.eq(a,b))) },
    { name: "transitive", check: ({P})=> P.elems.every(a=> P.elems.every(b=> P.elems.every(c=> !(P.leq(a,b) && P.leq(b,c)) || P.leq(a,c)))) },
  ];
}

export function completeLatticeLaws<A>(L: CompleteLattice<A>): Law<{L:CompleteLattice<A>}>[] {
  return [
    { name: "bot≤x", check: ({L})=> L.elems.every(x => L.leq(L.bot, x)) },
    { name: "x≤top", check: ({L})=> L.elems.every(x => L.leq(x, L.top)) },
    { name: "join is lub (sampled)", check: ({L})=> L.elems.every(x=> L.elems.every(y=>{
        const j = L.join(x,y);
        return L.leq(x,j) && L.leq(y,j) && L.elems.filter(u=> L.leq(x,u)&&L.leq(y,u)).every(u=> L.leq(j,u));
    }))},
    { name: "meet is glb (sampled)", check: ({L})=> L.elems.every(x=> L.elems.every(y=>{
        const m = L.meet(x,y);
        return L.leq(m,x) && L.leq(m,y) && L.elems.filter(u=> L.leq(u,x)&&L.leq(u,y)).every(u=> L.leq(u,m));
    }))},
  ];
}

/** Monotone fixed-point law (soundness): f(lfp f) = lfp f (sampled monotone functions can be supplied). */
export function lfpFixedPointLaw<A>(L: CompleteLattice<A>, f: (a:A)=>A): Law<{L:CompleteLattice<A>}> {
  return {
    name: "lfp is a fixed point",
    check: ({L})=> {
      const x = lfp(L, f);
      return L.eq(f(x) as any, x as any);
    }
  };
}