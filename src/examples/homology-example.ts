// homology-example.ts
import { Homology } from "../types/index.js";

type HomologyQuiver = Homology.HomologyQuiver;

// Example 1: a 4-cycle A→B→C→D→A (one loop), expect β0=1, β1=1
const Q1: HomologyQuiver = {
  objects: ["A","B","C","D"],
  edges: [
    {src:"A", dst:"B", label:"ab"},
    {src:"B", dst:"C", label:"bc"},
    {src:"C", dst:"D", label:"cd"},
    {src:"D", dst:"A", label:"da"}
  ]
};

// Example 2: two components, each a path (β0=2, β1=0)
const Q2: HomologyQuiver = {
  objects: ["P","Q","R","S"],
  edges: [
    {src:"P", dst:"Q", label:"pq"},
    {src:"R", dst:"S", label:"rs"}
  ]
};

for (const [name, Q] of Object.entries({Q1, Q2})) {
  const H = Homology.computeHomology01(Q as HomologyQuiver);
  console.log(`== ${name} ==`);
  console.log("β0 =", H.betti0, "β1 =", H.betti1);
  console.log("components:", H.components.map(c=>`{${c.join(",")}}`).join(" | "));
  console.log("#C0 =", H.debug.C0.length, "#C1 =", H.debug.C1.length, "#C2 =", H.debug.C2.length);
}