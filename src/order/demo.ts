import { Poset, isPoset } from "./Poset";
import { powersetLattice, lfp } from "./Lattice";
import { GaloisConnection, isGalois, closureOnX } from "./Galois";

// Demo 1: Simple poset on numbers
console.log("=== Demo 1: Number poset ===");
const numPoset: Poset<number> = {
  elems: [1, 2, 3, 4, 6, 12],
  leq: (a, b) => a <= b,
  eq: (a, b) => a === b
};

const posetCheck = isPoset(numPoset);
console.log("Is poset:", posetCheck.ok);
if (!posetCheck.ok) console.log("Error:", posetCheck.msg);

// Demo 2: Powerset lattice
console.log("\n=== Demo 2: Powerset lattice ===");
const U = ["red", "green", "blue"];
const P = powersetLattice(U, (a, b) => a === b);

console.log("Bottom (empty set):", P.show?.(P.bot) || P.bot);
console.log("Top (full set):", P.show?.(P.top) || P.top);
console.log("All elements:", P.elems.map(P.show || String));

// Demo 3: Least fixed point
console.log("\n=== Demo 3: Least fixed point ===");
const f = (S: string[]) => {
  const out = S.slice();
  if (S.includes("red") && !out.includes("green")) out.push("green");
  if (S.includes("green") && !out.includes("blue")) out.push("blue");
  return out;
};

const fixedPoint = lfp(P, f);
console.log("Fixed point of f:", P.show?.(fixedPoint) || fixedPoint);

// Demo 4: Galois connection
console.log("\n=== Demo 4: Galois connection ===");
const XU = ["a", "b"], YU = [1, 2];
const X = powersetLattice(XU, (x, y) => x === y);
const Y = powersetLattice(YU, (x, y) => x === y);

const R = new Map<string, number[]>([["a", [1]], ["b", [2]]]);

const alpha = (A: string[]) => {
  const out: number[] = [];
  for (const x of A) for (const y of (R.get(x) || []))
    if (!out.includes(y)) out.push(y);
  return out;
};

const gamma = (B: number[]) => {
  const out: string[] = [];
  for (const x of XU) {
    const imgs = R.get(x) || [];
    if (imgs.some(y => B.includes(y))) out.push(x);
  }
  return out;
};

const G: GaloisConnection<string[], number[]> = { X, Y, alpha, gamma };
console.log("Is Galois connection:", isGalois(G));

const closure = closureOnX(G);
const testSet = ["a"];
const closedSet = closure(testSet);
console.log("Closure of {a}:", X.show?.(closedSet) || closedSet);