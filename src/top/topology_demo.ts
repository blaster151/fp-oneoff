import { discrete, indiscrete, product, continuous } from "./Topology";
import { proj1, proj2, pair, checkProductUP } from "./ProductUP";
import { subspace } from "./Subspace";

console.log("🏠 Topology Demo - Finite Spaces and Product Universal Property\n");

// Demo 1: Basic topologies
console.log("1. Basic Topologies:");

const X = [0, 1, 2];
const TX_discrete = discrete(X);
const TX_indiscrete = indiscrete(X);

console.log("Set X:", X);
console.log("Discrete topology opens:", TX_discrete.opens);
console.log("Indiscrete topology opens:", TX_indiscrete.opens);

// Demo 2: Product topology
console.log("\n2. Product Topology:");

const Y = [10, 20];
const TY = discrete(Y);
const Tprod = product((a, b) => a === b, (a, b) => a === b, TX_discrete, TY);

console.log("Set Y:", Y);
console.log("Product space X × Y carrier:", Tprod.carrier);
console.log("Product topology opens count:", Tprod.opens.length);
console.log("Sample opens:", Tprod.opens.slice(0, 5));

// Demo 3: Continuity
console.log("\n3. Continuity:");

const eqNum = (a: number, b: number) => a === b;

// Identity function
const id = (x: number) => x;
const isIdContinuous = continuous(eqNum, eqNum, TX_discrete, TX_discrete, id);
console.log("Identity function continuous in discrete space:", isIdContinuous);

// Constant function
const const0 = (x: number) => 0;
const isConstContinuous = continuous(eqNum, eqNum, TX_discrete, TX_discrete, const0);
console.log("Constant function continuous in discrete space:", isConstContinuous);

// Function from discrete to indiscrete
const toIndiscrete = (x: number) => x;
const isToIndiscreteContinuous = continuous(eqNum, eqNum, TX_discrete, TX_indiscrete, toIndiscrete);
console.log("Function discrete → indiscrete continuous:", isToIndiscreteContinuous);

// Demo 4: Projections and Universal Property
console.log("\n4. Product Universal Property:");

const Z = [42];
const TZ = discrete(Z);

// Simple functions
const f = (z: number) => 0;
const g = (z: number) => 10;

console.log("Functions:");
console.log("  f: Z → X, f(42) = 0");
console.log("  g: Z → Y, g(42) = 10");

// Check universal property
const upResult = checkProductUP(eqNum, eqNum, eqNum, TZ, TX_discrete, TY, f, g, continuous);

console.log("Universal Property Check:");
console.log("  Projection π₁ continuous:", upResult.cProj1 ? "✅" : "❌");
console.log("  Projection π₂ continuous:", upResult.cProj2 ? "✅" : "❌");
console.log("  Pairing ⟨f,g⟩ continuous:", upResult.cPair ? "✅" : "❌");
console.log("  Uniqueness holds:", upResult.uniqueHolds ? "✅" : "❌");

// Demo 5: Subspace topology
console.log("\n5. Subspace Topology:");

const S = [0, 1]; // subspace of X
const Tsub = subspace(eqNum, TX_discrete, S);

console.log("Subspace S:", S);
console.log("Subspace topology opens:", Tsub.opens);

// Demo 6: Practical example - Product of two discrete spaces
console.log("\n6. Practical Example - Product of Discrete Spaces:");

const colors = ["red", "green", "blue"];
const sizes = ["S", "M", "L"];

const Tcolors = discrete(colors);
const Tsizes = discrete(sizes);

console.log("Colors:", colors);
console.log("Sizes:", sizes);
console.log("Color topology opens count:", Tcolors.opens.length);
console.log("Size topology opens count:", Tsizes.opens.length);

// Product of colors and sizes
const Tproduct = product(
  (a, b) => a === b,
  (a, b) => a === b,
  Tcolors,
  Tsizes
);

console.log("Product space (colors × sizes) carrier count:", Tproduct.carrier.length);
console.log("Product topology opens count:", Tproduct.opens.length);

// Sample product elements
console.log("Sample product elements:", Tproduct.carrier.slice(0, 5));

// Test projections
const colorProj = (item: {x: string, y: string}) => item.x;
const sizeProj = (item: {x: string, y: string}) => item.y;

const isColorProjContinuous = continuous(
  (a, b) => a.x === b.x && a.y === b.y,
  (a, b) => a === b,
  Tproduct,
  Tcolors,
  colorProj
);

const isSizeProjContinuous = continuous(
  (a, b) => a.x === b.x && a.y === b.y,
  (a, b) => a === b,
  Tproduct,
  Tsizes,
  sizeProj
);

console.log("Color projection continuous:", isColorProjContinuous ? "✅" : "❌");
console.log("Size projection continuous:", isSizeProjContinuous ? "✅" : "❌");

console.log("\n=== Topology Demo Complete ===");