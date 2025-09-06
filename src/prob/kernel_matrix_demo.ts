import { kernelToMatrix, matrixToKernel, approxEqMatrix, kernelsEq, Samples } from "./MarkovKernelIso";
import { kcomp } from "./Kleisli";

console.log("🔄 Markov Kernel ↔ Matrix Isomorphism Demo\n");

// Demo 1: Basic isomorphism
console.log("1. Basic Kernel ↔ Matrix Isomorphism:");

const A = [0, 1, 2];  // input states
const B = [10, 20];   // output states
const eqNum = (a: number, b: number) => a === b;

// Create a sample kernel
const weatherKernel = (state: number) => {
  switch (state) {
    case 0: return [{x: 10, p: 0.3}, {x: 20, p: 0.7}]; // sunny -> mostly hot
    case 1: return [{x: 10, p: 0.8}, {x: 20, p: 0.2}]; // cloudy -> mostly cool
    case 2: return [{x: 10, p: 0.1}, {x: 20, p: 0.9}]; // rainy -> mostly cold
    default: return [{x: 10, p: 1}];
  }
};

console.log("Weather kernel:");
for (const a of A) {
  console.log(`  ${a} -> ${JSON.stringify(weatherKernel(a))}`);
}

// Convert to matrix
const P = kernelToMatrix(A, B, eqNum, weatherKernel);
console.log("Matrix representation:");
console.log("  P =", P);

// Convert back to kernel
const kernelBack = matrixToKernel(A, B, P);
console.log("Back to kernel:");
for (const a of A) {
  console.log(`  ${a} -> ${JSON.stringify(kernelBack(a))}`);
}

// Verify isomorphism
const isIsomorphic = kernelsEq(A, eqNum, weatherKernel, kernelBack);
console.log("Isomorphism verified:", isIsomorphic ? "✅" : "❌");

// Demo 2: Sample kernels
console.log("\n2. Sample Kernels:");

const pointKernel = Samples.pointFirst<number, number>(B);
const uniformKernel = Samples.uniform<number, number>(B);
const modKernel = Samples.addOneMod<number, number>(B);

console.log("Point kernel (always first element):");
for (const a of A) {
  console.log(`  ${a} -> ${JSON.stringify(pointKernel(a))}`);
}

console.log("Uniform kernel:");
for (const a of A) {
  console.log(`  ${a} -> ${JSON.stringify(uniformKernel(a))}`);
}

console.log("Modular kernel (add 1 mod n):");
for (const a of A) {
  console.log(`  ${a} -> ${JSON.stringify(modKernel(a))}`);
}

// Demo 3: Matrix operations
console.log("\n3. Matrix Operations:");

const P1 = kernelToMatrix(A, B, eqNum, pointKernel);
const P2 = kernelToMatrix(A, B, eqNum, uniformKernel);

console.log("Point kernel matrix:", P1);
console.log("Uniform kernel matrix:", P2);

// Matrix equality
const areEqual = approxEqMatrix(P1, P2);
console.log("Matrices equal:", areEqual ? "✅" : "❌");

// Demo 4: Kernel composition
console.log("\n4. Kernel Composition:");

const tempKernel = (temp: number) => {
  if (temp === 10) return [{x: "cool", p: 0.6}, {x: "warm", p: 0.4}];
  else return [{x: "cool", p: 0.2}, {x: "warm", p: 0.8}];
};

const composedKernel = kcomp<number,string>(weatherKernel, tempKernel);
console.log("Composed kernel (weather -> temp -> description):");
for (const a of A) {
  console.log(`  ${a} -> ${JSON.stringify(composedKernel(a))}`);
}

// Demo 5: Round-trip verification
console.log("\n5. Round-trip Verification:");

const testKernels = [pointKernel, uniformKernel, modKernel, weatherKernel];
let allPassed = true;

for (let i = 0; i < testKernels.length; i++) {
  const k = testKernels[i];
  const P = kernelToMatrix(A, B, eqNum, k);
  const kBack = matrixToKernel(A, B, P);
  const passed = kernelsEq(A, eqNum, k, kBack);
  
  console.log(`Kernel ${i + 1} round-trip: ${passed ? "✅" : "❌"}`);
  if (!passed) allPassed = false;
}

console.log(`\nOverall round-trip success: ${allPassed ? "✅" : "❌"}`);

// Demo 6: Practical example - Markov chain
console.log("\n6. Practical Example - Weather Markov Chain:");

const weatherStates = ["sunny", "cloudy", "rainy"];
const weatherKernel2 = (state: string) => {
  switch (state) {
    case "sunny": return [{x: "sunny", p: 0.7}, {x: "cloudy", p: 0.3}];
    case "cloudy": return [{x: "sunny", p: 0.4}, {x: "cloudy", p: 0.4}, {x: "rainy", p: 0.2}];
    case "rainy": return [{x: "cloudy", p: 0.3}, {x: "rainy", p: 0.7}];
    default: return [{x: state, p: 1}];
  }
};

const weatherMatrix = kernelToMatrix(weatherStates, weatherStates, (a, b) => a === b, weatherKernel2);
console.log("Weather transition matrix:");
console.log("States:", weatherStates);
for (let i = 0; i < weatherMatrix.length; i++) {
  console.log(`  ${weatherStates[i]}: [${weatherMatrix[i].map(p => p.toFixed(2)).join(", ")}]`);
}

console.log("\n=== Kernel-Matrix Demo Complete ===");