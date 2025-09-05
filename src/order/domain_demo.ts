import { powersetCPO, lfpOmega, isScottContinuous, cpoFromPoset } from "./Domain";
import { posetFromPairs, subsetPoset, latticeFromPoset, completeFromBounded, Tiny } from "./dsl";
import { Poset } from "./Poset";

console.log("=== Domain Theory Demo ===");

// Demo 1: Powerset CPO with dependency closure
console.log("\n1. Powerset CPO with dependency closure:");
const U = ["a", "b", "c"];
const X = powersetCPO(U, (x, y) => x === y);

const f = (S: string[]) => {
  const out = S.slice();
  if (S.includes("a") && !out.includes("b")) out.push("b");
  if (S.includes("b") && !out.includes("c")) out.push("c");
  return out;
};

const M = { source: X, target: X, f };
console.log("Is Scott-continuous:", isScottContinuous(M));

const fix = lfpOmega(X, f);
console.log("Fixed point from ∅:", X.show?.(fix) || fix);

// Demo 2: Custom CPO from poset
console.log("\n2. Custom CPO from number chain:");
const E = [0, 1, 2, 3];
const P: Poset<number> = { elems: E, leq: (a, b) => a <= b, eq: (a, b) => a === b };
const C = cpoFromPoset(P, 0);

const g = (n: number) => Math.min(n + 1, 3);
const fix2 = lfpOmega(C, g);
console.log("Fixed point of f(n)=min(n+1,3):", fix2);

// Demo 3: DSL builders
console.log("\n3. DSL builders:");
const P2 = posetFromPairs(["x", "y", "z"], [["x", "y"], ["y", "z"]], (a, b) => a === b);
console.log("Transitive closure: x ≤ z?", P2.leq("x", "z"));

const subsetP = subsetPoset([0, 1], (a, b) => a === b);
const L = latticeFromPoset(subsetP);
const C2 = completeFromBounded(L);
console.log("Boolean lattice on {0,1}:");
console.log("  Bottom:", C2.show?.(C2.bot) || C2.bot);
console.log("  Top:", C2.show?.(C2.top) || C2.top);

const chain = Tiny.threeChain();
console.log("Three-chain: 0 ≤ 2?", chain.leq(0, 2));