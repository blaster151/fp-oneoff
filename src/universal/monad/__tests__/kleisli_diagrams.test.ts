import { describe, it, expect } from "vitest";
import { Signature } from "../../Signature";
import { Var, App } from "../../Term";
import { makeKleisliDiagramTools } from "../Diagram";

const MonSig: Signature = { ops: [{ name:"e", arity:0 }, { name:"mul", arity:2 }] };
const e = MonSig.ops[0], mul = MonSig.ops[1];
const assoc = { lhs: App(mul,[App(mul,[Var(0),Var(1)]), Var(2)]), rhs: App(mul,[Var(0), App(mul,[Var(1),Var(2)])]) };
const leftU = { lhs: App(mul,[App(e,[]), Var(0)]), rhs: Var(0) };
const rightU= { lhs: App(mul,[Var(0), App(e,[])]), rhs: Var(0) };

const Fin = <A>(xs:A[]) => ({ elems: xs, eq: (x:A,y:A)=>x===y });

describe("Kleisli diagrams (triangle & square) over monoid theory", () => {
  const { triangle, square } = makeKleisliDiagramTools(MonSig, [assoc,leftU,rightU], 2);

  const A = Fin(["a","b"]);
  const B = Fin([0,1]);
  const C = Fin(["X","Y"]);
  const D = Fin([10,11]);

  // Kleisli morphisms (A ⇝ B etc.): functions into T(carrier)
  const f = (a:string)=> a==="a" ? Var(0) : App(mul,[Var(1), App(e,[])]);
  const g = (b:number)=> b===0 ? App(mul,[Var(0),Var(0)]) : Var(1);
  const h = (a:string)=> a==="a" ? App(mul,[Var(0),Var(0)]) : Var(1); // should equal g ⋆ f

  it("triangle commutes for h = g ⋆ f", () => {
    const res = triangle(A,B,C,f,g,h);
    expect(res.commutes).toBe(true);
    expect(res.witnesses.length).toBe(0);
  });

  it("square detects a non-commuting case and reports witnesses", () => {
    const k_ok = (c:string)=> c==="X" ? Var(0) : Var(1);
    const g_bad = (b:number)=> b===0 ? Var(1) : Var(1); // intentionally break
    const res = square(A,B,C,D,f,g_bad, h, k_ok);
    expect(res.commutes).toBe(false);
    expect(res.witnesses.length).toBeGreaterThan(0);
  });
});