import { DistMonad, eqDist, normalize } from "./Dist";
import { isRowStochastic, compose, idStoch, push } from "./Markov";

console.log("🎲 Probability & Stochastic Processes Demo\n");

// Demo 1: Finite distributions and monad laws
console.log("1. Finite Probability Distributions:");
const d1 = [{x: 1, p: 0.3}, {x: 2, p: 0.7}];
const d2 = [{x: 2, p: 0.4}, {x: 3, p: 0.6}];

console.log("Distribution 1:", d1);
console.log("Distribution 2:", d2);

// Monad operations
const f = (x: number) => [{x: x + 1, p: 0.5}, {x: x * 2, p: 0.5}];
const chained = DistMonad.chain(d1, f);
console.log("Chain d1 with f:", chained);

const mapped = DistMonad.map(d1, x => x * 2);
console.log("Map d1 with x*2:", mapped);

// Demo 2: Markov kernels (stochastic matrices)
console.log("\n2. Markov Kernels (Stochastic Matrices):");
const P = [[0.2, 0.8], [0.5, 0.5]];
const Q = [[1, 0], [0.3, 0.7]];

console.log("Matrix P:", P);
console.log("Matrix Q:", Q);
console.log("P is row-stochastic:", isRowStochastic(P));
console.log("Q is row-stochastic:", isRowStochastic(Q));

// Composition
const PQ = compose(P, Q);
console.log("P ∘ Q:", PQ);
console.log("P ∘ Q is row-stochastic:", isRowStochastic(PQ));

// Identity
const I = idStoch(2);
console.log("Identity matrix I:", I);

// Push forward
const d = [0.4, 0.6];
const pushed = push(d, P);
console.log("Push distribution [0.4, 0.6] through P:", pushed);

// Demo 3: Normalization
console.log("\n3. Distribution Normalization:");
const unnormalized = [{x: 1, p: 0.2}, {x: 2, p: 0.3}, {x: 1, p: 0.1}];
const normalized = normalize(unnormalized);
console.log("Unnormalized:", unnormalized);
console.log("Normalized:", normalized);

console.log("\n=== Demo Complete ===");