import type { Law, Lawful } from "./Witness";
import { discrete, continuous } from "../top/Topology";
import { checkProductUP } from "../top/ProductUP";

const eqNum = (a:number,b:number)=>a===b;

export function lawfulTopProductUP(): Lawful<any, {tag:"Top/ProductUP"}> {
  const tag = "Top/ProductUP";
  const X = [0,1], Y = [10,20,30], Z = [42,99];
  const TX = discrete(X), TY = discrete(Y), TZ = discrete(Z);
  const f = (z:number)=> (z===42?0:1);
  const g = (_:number)=> 20;

  const laws: Law<any>[] = [
    {
      name: "projections continuous, pairing continuous, UP equations",
      check: () => {
        const res = checkProductUP(eqNum, eqNum, eqNum, TZ, TX, TY, f, g, continuous);
        return res.cProj1 && res.cProj2 && res.cPair && res.uniqueHolds;
      }
    }
  ];

  return { tag, eq: (a:any,b:any)=>a===b, struct: { tag }, laws };
}