import { registerLawful } from "./registry";
import { lawfulMonoid } from "./Monoid";
import { posetLaws } from "./Order";
import { runLaws } from "./Witness";
import { powersetLattice } from "../order/Lattice";
import { powersetCPO } from "../order/Domain";

// Example: Monoid<number> under addition
const eqNum = (a:number,b:number)=> a===b;
const Sum = { empty: 0, concat: (x:number,y:number)=> x+y };
const sumPack = lawfulMonoid("Monoid/number/sum", eqNum, Sum, [0,1,2,3]);
sumPack.run = () => runLaws(sumPack.laws, { M: Sum, xs: [0,1,2,3] });
registerLawful(sumPack);

// Example: Monoid<string> under concatenation
const eqString = (a:string,b:string)=> a===b;
const Concat = { empty: "", concat: (x:string,y:string)=> x+y };
const concatPack = lawfulMonoid("Monoid/string/concat", eqString, Concat, ["a", "b", "c"]);
concatPack.run = () => runLaws(concatPack.laws, { M: Concat, xs: ["a", "b", "c"] });
registerLawful(concatPack);

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

// Ring law packs
import { ZnRing } from "../structures/ring/Ring";
import { PolyRing } from "../structures/ring/Poly";

// Ring multiplicative monoid laws
const Z6 = ZnRing(6);
const Z6MultMonoid = {
  empty: Z6.one,
  concat: Z6.mul
};
const z6Pack = lawfulMonoid("Ring/Zn", Z6.eq, Z6MultMonoid, Z6.elems);
z6Pack.run = () => runLaws(z6Pack.laws, { M: Z6MultMonoid, xs: Z6.elems });
registerLawful(z6Pack);

// Polynomial ring laws
const Z2Poly = PolyRing(2, 2); // Z/2[x]/(x^3)
const Z2PolyMultMonoid = {
  empty: Z2Poly.one,
  concat: Z2Poly.mul
};
const polySamples = Z2Poly.elems.slice(0, 8); // limit samples
const polyPack = lawfulMonoid("Ring/Poly(Zn)[trunc]", Z2Poly.eq, Z2PolyMultMonoid, polySamples);
polyPack.run = () => runLaws(polyPack.laws, { M: Z2PolyMultMonoid, xs: polySamples });
registerLawful(polyPack);

// CPO law packs
const U2 = [1, 2, 3];
const CPO = powersetCPO(U2, (a, b) => a === b);
const cpoLawsList = posetLaws(CPO);
registerLawful({
  tag: "CPO/powerset",
  eq: CPO.eq,
  struct: CPO,
  laws: cpoLawsList,
  run: () => runLaws(cpoLawsList, { P: CPO })
});

// TODO: import and register more packs here as you build them, e.g.:
// import { someLatticePack } from "../order/whatever";
// registerLawful(someLatticePack);

// Example pattern for a two-sided isomorphism pack that exposes .run():
// import { lawfulCodensityIso } from "./examples/CodensityNat";
// registerLawful(lawfulCodensityIso(myCodensityNatPack));