// homology-snf-example.ts
import { Homology } from "../types/index.js";

type HomologyQuiver = Homology.HomologyQuiver;
type HomologyBuildOptions = Homology.HomologyBuildOptions;
type SSet02 = Homology.SSet02;

// Quiver 1: 4-cycle (β0=1, β1=1, torsion none)
const Q1: HomologyQuiver = {
  objects: ["A","B","C","D"],
  edges: [
    {src:"A", dst:"B", label:"ab"},
    {src:"B", dst:"C", label:"bc"},
    {src:"C", dst:"D", label:"cd"},
    {src:"D", dst:"A", label:"da"}
  ]
};

// Quiver 2: two components (β0=2, β1=0)
const Q2: HomologyQuiver = {
  objects: ["P","Q","R","S"],
  edges: [
    {src:"P", dst:"Q", label:"pq"},
    {src:"R", dst:"S", label:"rs"}
  ]
};

const opt2: HomologyBuildOptions = { maxPathLen: 2 };
for (const [name, Q] of Object.entries({Q1, Q2})) {
  const HQ = Homology.computeHomology01(Q as HomologyQuiver, opt2);
  const HZ = Homology.computeHomology01_Z(Q as HomologyQuiver, opt2);
  console.log(`== ${name} ==`);
  console.log("Q-ranks β0,β1:", HQ.betti0, HQ.betti1);
  console.log("Z-structure H0:", `Z^${HZ.H0.rank}`, " H1:", `Z^${HZ.H1.rank}`,
              HZ.H1.torsion.length? (" ⊕ " + HZ.H1.torsion.map(d=>`Z/${d}`).join(" ⊕ ")) : "");
}

// Minimal simplicial set example (a filled triangle): H1=0
const S: SSet02 = {
  V: ["v0","v1","v2"],
  E: [
    { key:"e01", faces:["v0", "v1"] },
    { key:"e12", faces:["v1", "v2"] },
    { key:"e02", faces:["v0", "v2"] }
  ],
  T: [
    { key:"t012", faces:["e02", "e12", "e01"] } // faces keyed in the convention [f2,f1,f0]
  ]
};
const HS = Homology.H01_fromSSet_Z(S);
console.log("== SSet triangle ==", HS);

// Horn check demo: expect none missing (we included the triangle)
console.log("Missing inner horns Λ^2_1:", Homology.missingInnerHorns2(S));