import { discrete, indiscrete, continuous, product } from "./Topology";
import { subspace } from "./Subspace";
import { inclusion, mapsEqual } from "./Embeddings";
import { proj1, proj2, pair } from "./ProductUP";
import { sierpinski } from "./Spaces";

console.log("🏠 Extended Topology Demo - Beyond Discrete Spaces\n");

const eqNum = (a: number, b: number) => a === b;

// Demo 1: Sierpinski Space
console.log("1. Sierpinski Space:");
const TSp = sierpinski();
console.log("Carrier:", TSp.carrier);
console.log("Open sets:", TSp.opens);
console.log("Description: ∅, {1}, {0,1} - the smallest non-trivial topology");

// Demo 2: Subspace Topology and Inclusion
console.log("\n2. Subspace Topology and Inclusion:");

const X = [0, 1, 2, 3];
const TX = discrete(X);
const S = [0, 2, 3]; // subspace
const TS = subspace(eqNum, TX, S);

console.log("Parent space X:", X);
console.log("Parent topology opens count:", TX.opens.length);
console.log("Subspace S:", S);
console.log("Subspace topology opens:", TS.opens);

// Test inclusion continuity
const i = inclusion(eqNum, S, X);
const isInclusionContinuous = continuous(eqNum, eqNum, TS, TX, i);
console.log("Inclusion map continuous:", isInclusionContinuous ? "✅" : "❌");

// Demo 3: Non-discrete Continuity
console.log("\n3. Non-discrete Continuity:");

// Function from Sierpinski to indiscrete
const f = (s: number) => s === 1 ? 0 : 1;
const TXi = indiscrete([0, 1, 2]);

console.log("Function f: Sierpinski → indiscrete");
console.log("f(0) =", f(0), ", f(1) =", f(1));

const isFContinuous = continuous(eqNum, eqNum, TSp, TXi, f);
console.log("f is continuous:", isFContinuous ? "✅" : "❌");

// Function from indiscrete to indiscrete
const g = (_: number) => 2;
const isGContinuous = continuous(eqNum, eqNum, TXi, TXi, g);
console.log("g: indiscrete → indiscrete, g(x) = 2");
console.log("g is continuous:", isGContinuous ? "✅" : "❌");

// Composition
const comp = (s: number) => g(f(s));
const isCompContinuous = continuous(eqNum, eqNum, TSp, TXi, comp);
console.log("g ∘ f is continuous:", isCompContinuous ? "✅" : "❌");

// Demo 4: Product Universal Property
console.log("\n4. Product Universal Property:");

const X_prod = [0, 1];
const Y_prod = [10, 20, 30];
const Z_prod = [42, 99];

const TX_prod = discrete(X_prod);
const TY_prod = discrete(Y_prod);
const TZ_prod = discrete(Z_prod);
const Tprod = product(eqNum, eqNum, TX_prod, TY_prod);

console.log("Product space X × Y:");
console.log("X =", X_prod);
console.log("Y =", Y_prod);
console.log("X × Y carrier count:", Tprod.carrier.length);
console.log("Sample elements:", Tprod.carrier.slice(0, 3));

// Test projections
const isProj1Continuous = continuous(
  (a: any, b: any) => a.x === b.x && a.y === b.y,
  eqNum,
  Tprod,
  TX_prod,
  proj1
);
const isProj2Continuous = continuous(
  (a: any, b: any) => a.x === b.x && a.y === b.y,
  eqNum,
  Tprod,
  TY_prod,
  proj2
);

console.log("Projection π₁ continuous:", isProj1Continuous ? "✅" : "❌");
console.log("Projection π₂ continuous:", isProj2Continuous ? "✅" : "❌");

// Test pairing
const f_pair = (z: number) => z === 42 ? 0 : 1;
const g_pair = (_: number) => 20;
const p = pair(f_pair, g_pair);

const isPairContinuous = continuous(
  eqNum,
  (a: any, b: any) => a.x === b.x && a.y === b.y,
  TZ_prod,
  Tprod,
  p
);

console.log("Pairing ⟨f,g⟩ continuous:", isPairContinuous ? "✅" : "❌");

// Test universal property equations
const eqs1 = mapsEqual(eqNum, TZ_prod.carrier, (z) => proj1(p(z)), f_pair);
const eqs2 = mapsEqual(eqNum, TZ_prod.carrier, (z) => proj2(p(z)), g_pair);

console.log("Universal property equations:");
console.log("π₁ ∘ ⟨f,g⟩ = f:", eqs1 ? "✅" : "❌");
console.log("π₂ ∘ ⟨f,g⟩ = g:", eqs2 ? "✅" : "❌");

// Demo 5: Function Equality
console.log("\n5. Function Equality:");

const h1 = (x: number) => x * 2;
const h2 = (x: number) => x + x;
const h3 = (x: number) => x * 3;

const domain = [0, 1, 2];

const h1EqH2 = mapsEqual(eqNum, domain, h1, h2);
const h1EqH3 = mapsEqual(eqNum, domain, h1, h3);

console.log("Functions on domain [0, 1, 2]:");
console.log("h1(x) = 2x, h2(x) = x + x");
console.log("h1 = h2:", h1EqH2 ? "✅" : "❌");
console.log("h1(x) = 2x, h3(x) = 3x");
console.log("h1 = h3:", h1EqH3 ? "✅" : "❌");

// Demo 6: Topology Comparison
console.log("\n6. Topology Comparison:");

const small = [0, 1];
const T_discrete = discrete(small);
const T_indiscrete = indiscrete(small);
const T_sierpinski = sierpinski();

console.log("Space [0, 1] with different topologies:");
console.log("Discrete opens:", T_discrete.opens.length, "sets");
console.log("Indiscrete opens:", T_indiscrete.opens.length, "sets");
console.log("Sierpinski opens:", T_sierpinski.opens.length, "sets");

// Test continuity between different topologies
const id = (x: number) => x;
const const0 = (x: number) => 0;

const idDiscreteToIndiscrete = continuous(eqNum, eqNum, T_discrete, T_indiscrete, id);
const constDiscreteToIndiscrete = continuous(eqNum, eqNum, T_discrete, T_indiscrete, const0);

console.log("Continuity tests:");
console.log("id: discrete → indiscrete:", idDiscreteToIndiscrete ? "✅" : "❌");
console.log("const: discrete → indiscrete:", constDiscreteToIndiscrete ? "✅" : "❌");

console.log("\n=== Extended Topology Demo Complete ===");