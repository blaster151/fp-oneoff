import { registerLawful } from "./registry";
import { lawfulMonoid } from "./Monoid";
import { posetLaws } from "./Order";
import { runLaws } from "./Witness";
import { powersetLattice } from "../order/Lattice";

// Example: Monoid<number> under addition
const eqNum = (a:number,b:number)=> a===b;
const Sum = { empty: 0, concat: (x:number,y:number)=> x+y };
registerLawful(lawfulMonoid("Monoid/number/sum", eqNum, Sum, [0,1,2,3]));

// Example: Monoid<string> under concatenation
const eqString = (a:string,b:string)=> a===b;
const Concat = { empty: "", concat: (x:string,y:string)=> x+y };
registerLawful(lawfulMonoid("Monoid/string/concat", eqString, Concat, ["a", "b", "c"]));

// Example: Poset laws for number ordering
const numberPoset = {
  elems: [1, 2, 3, 4, 5],
  leq: (a: number, b: number) => a <= b,
  eq: (a: number, b: number) => a === b
};
const posetLawsList = posetLaws(numberPoset);
registerLawful({
  tag: "Poset/number/leq",
  eq: numberPoset.eq,
  struct: numberPoset,
  laws: posetLawsList,
  run: () => runLaws(posetLawsList, { P: numberPoset })
});

// Example: Complete lattice laws for powerset
const U = [1, 2, 3];
const L = powersetLattice(U, (a, b) => a === b);
const latticeLawsList = posetLaws(L);
registerLawful({
  tag: "CompleteLattice/powerset/{1,2,3}",
  eq: L.eq,
  struct: L,
  laws: latticeLawsList,
  run: () => runLaws(latticeLawsList, { P: L })
});

// Import concrete examples
import "./examples/ConcreteCodensity"; // side-effect: registers codensity law pack

// TODO: import and register more packs here as you build them, e.g.:
// import { someLatticePack } from "../order/whatever";
// registerLawful(someLatticePack);

// Example pattern for a two-sided isomorphism pack that exposes .run():
// import { lawfulCodensityIso } from "./examples/CodensityNat";
// registerLawful(lawfulCodensityIso(myCodensityNatPack));