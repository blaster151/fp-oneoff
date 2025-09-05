import type { Law, Lawful } from "./Witness";
import { discrete, indiscrete, continuous } from "../top/Topology";
import { subspace } from "../top/Subspace";
import { inclusion, mapsEqual } from "../top/Embeddings";
import { product } from "../top/Topology";
import { proj1, proj2, pair } from "../top/ProductUP";
import { sierpinski } from "../top/Spaces";

const eqNum = (a:number,b:number)=>a===b;

export function lawfulTopContinuity(): Lawful<any, {tag:"Top/Continuity"}> {
  const tag = "Top/Continuity";

  const X = [0,1,2];
  const TXd = discrete(X);
  const TXi = indiscrete(X);
  const TSp = sierpinski(); // carrier [0,1]

  const laws: Law<any>[] = [
    {
      name: "subspace inclusion is continuous",
      check: ()=> {
        const S = [0,2];
        const TS = subspace(eqNum, TXd, S);
        const i = inclusion(eqNum, S, TXd.carrier);
        return continuous(eqNum, eqNum, TS, TXd, i);
      }
    },
    {
      name: "continuity closed under composition",
      check: ()=> {
        // f : Sierpinski -> indiscrete(X) (any function is continuous into indiscrete)
        const f = (s:number)=> (s===1? 0 : 1);
        // g : indiscrete(X) -> indiscrete(X) (any function is continuous from/to indiscrete)
        const g = (_:number)=> 2;
        const c1 = continuous(eqNum, eqNum, TSp, TXi, f);
        const c2 = continuous(eqNum, eqNum, TXi, TXi, g);
        const comp = (s:number)=> g(f(s));
        const cComp = continuous(eqNum, eqNum, TSp, TXi, comp);
        return c1 && c2 && cComp;
      }
    },
    {
      name: "product projections continuous; pairing satisfies equations (discrete example)",
      check: ()=> {
        const X = [0,1], Y = [10,20,30], Z = [42,99];
        const TX = discrete(X), TY = discrete(Y), TZ = discrete(Z);
        const f = (z:number)=> (z===42?0:1);
        const g = (_:number)=> 20;
        const Tprod = product(eqNum, eqNum, TX, TY);
        const p = pair(f,g);
        const eqPair = (z:number)=> ( { x: f(z), y: g(z) } );
        const contProj1 = continuous((a:any,b:any)=>a.x===b.x && a.y===b.y, eqNum, Tprod, TX, proj1);
        const contProj2 = continuous((a:any,b:any)=>a.x===b.x && a.y===b.y, eqNum, Tprod, TY, proj2);
        const contPair  = continuous(eqNum, (a:any,b:any)=>a.x===b.x && a.y===b.y, TZ, Tprod, p);
        const eqs = mapsEqual(eqNum, TZ.carrier, (z)=> proj1(p(z)), f) &&
                    mapsEqual(eqNum, TZ.carrier, (z)=> proj2(p(z)), g);
        return contProj1 && contProj2 && contPair && eqs &&
               mapsEqual((a:any,b:any)=>a.x===b.x && a.y===b.y, TZ.carrier, p, eqPair);
      }
    }
  ];

  return { tag, eq: (a:any,b:any)=>a===b, struct: { tag }, laws };
}