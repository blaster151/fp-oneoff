import { Signature, opOf } from "../Signature";
import type { UAAlgebra } from "../Algebra";

export const MonoidSig: Signature = {
  ops: [
    { name: "e", arity: 0 },
    { name: "mul", arity: 2 }
  ]
};

export function ZmodAsMonoid(n: number): UAAlgebra<number> {
  const sig = MonoidSig;
  const elems = Array.from({length:n}, (_,i)=>i);
  const eq = (a:number,b:number)=>a===b;
  const interpret = (op: any) => {
    if (op.name === "e") return () => 0;
    if (op.name === "mul") return (a:number,b:number)=> (a+b)%n; // "+" as monoid op
    throw new Error("unknown op");
  };
  return { sig, elems, eq, interpret };
}