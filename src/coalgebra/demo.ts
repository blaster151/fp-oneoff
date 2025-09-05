import { Moore, isCoalgebraHom } from "./Coalgebra";

console.log("🔄 Coalgebra & Moore Machines Demo\n");

// Demo: Simple state machine
type State = "A" | "B" | "C";
type Input = 0 | 1;

// Moore machine: states {A,B,C}, inputs {0,1}, outputs {0,1,2}
const M: Moore<number, Input, State> = {
  carrier: ["A", "B", "C"],
  out: (x) => x === "A" ? 0 : x === "B" ? 1 : 2,
  step: (x, a) => {
    // State transition table
    if (x === "A") return a === 0 ? "A" : "B";
    if (x === "B") return a === 0 ? "C" : "A";
    if (x === "C") return a === 0 ? "B" : "C";
    return x; // fallback
  }
};

console.log("Moore Machine M:");
console.log("States:", M.carrier);
console.log("Output function:");
for (const state of M.carrier) {
  console.log(`  out(${state}) = ${M.out(state)}`);
}
console.log("Transition function:");
for (const state of M.carrier) {
  for (const input of [0, 1] as Input[]) {
    console.log(`  step(${state}, ${input}) = ${M.step(state, input)}`);
  }
}

// Test coalgebra homomorphism (identity)
console.log("\nCoalgebra Homomorphism Test:");
const identity = (x: State) => x;
const isHom = isCoalgebraHom(M, M, identity);
console.log("Identity is a coalgebra homomorphism M→M:", isHom);

// Demo: Another Moore machine with different structure
const N: Moore<number, Input, State> = {
  carrier: ["A", "B", "C"],
  out: (x) => x === "A" ? 0 : x === "B" ? 1 : 2,
  step: (x, a) => {
    // Different transition table
    if (x === "A") return a === 0 ? "B" : "C";
    if (x === "B") return a === 0 ? "A" : "B";
    if (x === "C") return a === 0 ? "C" : "A";
    return x; // fallback
  }
};

console.log("\nMoore Machine N (different transitions):");
console.log("Transition function:");
for (const state of N.carrier) {
  for (const input of [0, 1] as Input[]) {
    console.log(`  step(${state}, ${input}) = ${N.step(state, input)}`);
  }
}

// Test if identity is a homomorphism between different machines
const isHomMN = isCoalgebraHom(M, N, identity);
console.log("Identity is a coalgebra homomorphism M→N:", isHomMN);

// Demo: State mapping
const stateMap = (x: State): State => {
  // Map A→B, B→C, C→A
  if (x === "A") return "B";
  if (x === "B") return "C";
  return "A";
};

console.log("\nState Mapping Test:");
console.log("Mapping: A→B, B→C, C→A");
const isHomMap = isCoalgebraHom(M, M, stateMap);
console.log("State mapping is a coalgebra homomorphism M→M:", isHomMap);

console.log("\n=== Demo Complete ===");