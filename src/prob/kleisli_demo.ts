import { DistMonad, eqDist } from "./Dist";
import { Kernel, kid, kcomp, kmap } from "./Kleisli";

console.log("🔄 Kleisli Category Demo for Probability Distributions\n");

// Demo 1: Basic Kleisli operations
console.log("1. Kleisli Identity and Composition:");

// Define some kernels
const incK: Kernel<number, number> = (a) => [{x: a+1, p: 0.4}, {x: a+2, p: 0.6}];
const dblK: Kernel<number, number> = (a) => [{x: 2*a, p: 1}];
const stepK: Kernel<number, number> = (a) => [{x: a-1, p: 0.3}, {x: a+3, p: 0.7}];

console.log("Kernel incK(1):", incK(1));
console.log("Kernel dblK(2):", dblK(2));

// Kleisli identity
const idK = kid<number>();
console.log("Identity kernel idK(1):", idK(1));

// Kleisli composition
const composed = kcomp(incK, dblK);
console.log("Composed kernel (incK ▷ dblK)(1):", composed(1));

// Triple composition
const triple = kcomp(kcomp(incK, dblK), stepK);
console.log("Triple composition (incK ▷ dblK ▷ stepK)(1):", triple(1));

// Demo 2: Category laws
console.log("\n2. Category Laws Verification:");

const A = [0, 1, 2];
const eqNum = (a: number, b: number) => a === b;

// Left identity: kid ▷ k = k
let leftIdHolds = true;
for (const a of A) {
  const lhs = kcomp(idK, incK)(a);
  const rhs = incK(a);
  if (!eqDist(eqNum, lhs, rhs)) {
    leftIdHolds = false;
    break;
  }
}
console.log("Left identity (kid ▷ k = k):", leftIdHolds ? "✅" : "❌");

// Right identity: k ▷ kid = k
let rightIdHolds = true;
for (const a of A) {
  const lhs = kcomp(incK, idK)(a);
  const rhs = incK(a);
  if (!eqDist(eqNum, lhs, rhs)) {
    rightIdHolds = false;
    break;
  }
}
console.log("Right identity (k ▷ kid = k):", rightIdHolds ? "✅" : "❌");

// Associativity: (k ▷ l) ▷ m = k ▷ (l ▷ m)
let assocHolds = true;
for (const a of A) {
  const lhs = kcomp(kcomp(incK, dblK), stepK)(a);
  const rhs = kcomp(incK, kcomp(dblK, stepK))(a);
  if (!eqDist(eqNum, lhs, rhs)) {
    assocHolds = false;
    break;
  }
}
console.log("Associativity ((k ▷ l) ▷ m = k ▷ (l ▷ m)):", assocHolds ? "✅" : "❌");

// Demo 3: Naturality of kmap
console.log("\n3. Naturality of Post-Map:");

const g = (b: number) => b % 2; // map to {0, 1}
const mappedK = kmap(incK, g);
console.log("Original kernel incK(1):", incK(1));
console.log("Mapped kernel kmap(incK, g)(1):", mappedK(1));

// Test naturality: kmap(k ∘ h, g) = (kmap(k, g)) ∘ h
const h = (z: {n: number}) => z.n;
const Z = [{n: 0}, {n: 1}, {n: 2}];

let naturalityHolds = true;
for (const z of Z) {
  const lhs = kmap(incK, g)(h(z));
  const rhs = (a => kmap(incK, g)(a))(h(z));
  if (!eqDist((x: number, y: number) => x === y, lhs, rhs)) {
    naturalityHolds = false;
    break;
  }
}
console.log("Naturality of kmap:", naturalityHolds ? "✅" : "❌");

// Demo 4: Practical example - Markov chain
console.log("\n4. Practical Example - Simple Markov Chain:");

// State transition kernel
const weatherK: Kernel<string, string> = (state) => {
  switch (state) {
    case "sunny": return [{x: "sunny", p: 0.7}, {x: "rainy", p: 0.3}];
    case "rainy": return [{x: "sunny", p: 0.4}, {x: "rainy", p: 0.6}];
    default: return [{x: state, p: 1}];
  }
};

// Temperature kernel (depends on weather)
const tempK: Kernel<string, number> = (weather) => {
  switch (weather) {
    case "sunny": return [{x: 25, p: 0.6}, {x: 30, p: 0.4}];
    case "rainy": return [{x: 15, p: 0.5}, {x: 20, p: 0.5}];
    default: return [{x: 20, p: 1}];
  }
};

// Compose weather and temperature kernels
const weatherTempK = kcomp(weatherK, tempK);
console.log("Weather kernel for 'sunny':", weatherK("sunny"));
console.log("Temperature kernel for 'sunny':", tempK("sunny"));
console.log("Composed kernel for 'sunny':", weatherTempK("sunny"));

// Map temperature to categories
const categoryK = kmap(tempK, (temp) => temp < 20 ? "cold" : temp < 25 ? "mild" : "hot");
console.log("Temperature category kernel for 'sunny':", categoryK("sunny"));

console.log("\n=== Kleisli Demo Complete ===");