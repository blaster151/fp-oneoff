import type { Law, Lawful } from "./Witness";
import { discrete, indiscrete, continuous } from "../top/Topology";

const eqNum = (a:number,b:number)=>a===b;

export function lawfulTopContinuity(): Lawful<any, {tag:"Top/Continuity"}> {
  const tag = "Top/Continuity";
  const X = [0,1,2];
  const Y = [10,20];

  const laws: Law<any>[] = [
    {
      name: "identity function is continuous",
      check: () => {
        const TX = discrete(X);
        const id = (x: number) => x;
        return continuous(eqNum, eqNum, TX, TX, id);
      }
    },
    {
      name: "constant function is continuous",
      check: () => {
        const TX = discrete(X);
        const const10 = (x: number) => 10;
        const TY = discrete(Y);
        return continuous(eqNum, eqNum, TX, TY, const10);
      }
    },
    {
      name: "function discrete to indiscrete is continuous",
      check: () => {
        const TX = discrete(X);
        const TY = indiscrete(Y);
        const f = (x: number) => 10;
        return continuous(eqNum, eqNum, TX, TY, f);
      }
    },
    {
      name: "composition of continuous functions is continuous",
      check: () => {
        const TX = discrete(X);
        const TY = discrete(Y);
        const TZ = discrete([100,200]);
        
        const f = (x: number) => x === 0 ? 10 : 20;
        const g = (y: number) => y === 10 ? 100 : 200;
        const h = (x: number) => g(f(x));
        
        const fCont = continuous(eqNum, eqNum, TX, TY, f);
        const gCont = continuous(eqNum, eqNum, TY, TZ, g);
        const hCont = continuous(eqNum, eqNum, TX, TZ, h);
        
        return fCont && gCont && hCont;
      }
    }
  ];

  return { tag, eq: (a:any,b:any)=>a===b, struct: { tag }, laws };
}