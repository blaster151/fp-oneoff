/**
 * Developer Demo (relations-focused):
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import {
  Finite, Rel, Fun, companion, conjoint
} from "../types/rel-equipment.js";

console.log("🎯 Simple Category/Relations Demo");
console.log("================================\n");

// ---------- Simple relations over finite sets ----------
console.log("1️⃣ Building relations...");

const X = new Finite(["x1","x2"]);
const Y = new Finite(["y1","y2"]);
const Z = new Finite(["z1","z2"]);

const R1 = Rel.fromPairs(X, Y, [["x1","y1"], ["x2","y2"]]);
const R2 = Rel.fromPairs(Y, Z, [["y1","z1"], ["y2","z2"]]);

console.log("R1 pairs:", R1.toPairs());
console.log("R2 pairs:", R2.toPairs());

// ---------- Companions / conjoints for a function ----------
console.log("\n2️⃣ Companions & Conjoints...");

const f: Fun<string,string> = a => (a === "x1" ? "y1" : "y2");

// Companion graph ⟨f⟩ : X → Y and conjoint ⟨f⟩† : Y → X
const comp = companion(X, Y, f);
const conj = conjoint(X, Y, f);

console.log("Companion ⟨f⟩ pairs:", comp.toPairs());
console.log("Conjoint ⟨f⟩† pairs:", conj.toPairs());

// ---------- Composition example ----------
console.log("\n3️⃣ Composition...");

const R1_then_R2 = R1.compose(R2 as any);
console.log("R1;R2 pairs:", R1_then_R2.toPairs());

console.log("\n🎉 Demo completed successfully!");
