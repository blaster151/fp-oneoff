import { FiniteMonoid, checkMonoid } from "../Monoid";

export function ZnAdd(n: number): FiniteMonoid<number> {
  const elems = Array.from({length:n}, (_,i)=>i);
  const eq = (a:number,b:number)=>a===b;
  const op = (a:number,b:number)=>(a+b)%n;
  const e = 0;
  const M = { elems, eq, op, e };
  const ok = checkMonoid(M);
  if (!ok.ok) throw new Error(ok.msg);
  return M;
}

export function StringsOver(alphabet: string[]): FiniteMonoid<string> {
  // Finite for tests if alphabet small and we bound length—here we include short words only in elems.
  // But the *structure* is the free monoid; elems list is just a finite sample used in tests.
  const eq = (a:string,b:string)=>a===b;
  const op = (a:string,b:string)=>a+b;
  const e = "";
  // Provide a small finite window for property checks:
  const sample: string[] = [""];
  for (const a of alphabet) sample.push(a);
  for (const a of alphabet) for (const b of alphabet) sample.push(a+b);
  const M = { elems: Array.from(new Set(sample)), eq, op, e };
  return M;
}