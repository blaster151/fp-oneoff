import { FiniteGroup, checkGroup } from "./Group";

/** Units modulo n under multiplication (only for small n used in tests). */
export function UnitsMod(n: number) {
  const elems = Array.from({length: n}, (_,i)=>i).filter(i => gcd(i,n)===1);
  const eq = (a:number,b:number)=>a===b;
  const op = (a:number,b:number)=> (a*b) % n;
  const id = 1 % n;
  const inv = (a:number)=> {
    for (let x=0;x<n;x++) if ((a*x) % n === 1 % n) return x;
    throw new Error(`no inverse for ${a} mod ${n}`);
  };
  const U = { elems, eq, op, id, inv, label: `U(${n})` } as const;
  checkGroup(U);
  return U;
}
const gcd = (a:number,b:number)=> b===0? Math.abs(a): gcd(b, a%b);