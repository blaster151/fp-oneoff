import { Group } from "./structures";

export function ZmodAdd(n: number): Group<number> {
  const mod = (x:number) => ((x % n) + n) % n;
  const elems = Array.from({length:n}, (_,i)=>i);
  return {
    name: `Z_${n}`,
    elems,
    op: (a,b) => mod(a+b),
    e: 0,
    inv: a => mod(-a),
    eq: (a,b) => a === b
  };
}