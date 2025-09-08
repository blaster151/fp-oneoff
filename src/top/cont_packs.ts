import { registerCont } from "./ContRegistry";
import { discrete, indiscrete, product } from "./Topology";
import { subspace } from "./Subspace";
import { inclusion } from "./Embeddings";
import { proj1, proj2, pair } from "./ProductUP";

const eqNum = (a:number,b:number)=>a===b;

// Spaces
const X = [0,1,2];
const Y = [10,20,30];
const Z = [42,99];

const TXd = discrete(X);
const TYd = discrete(Y);
const TZd = discrete(Z);
const TXi = indiscrete(X);

// 1) Subspace inclusion i: S -> X (discrete case)
const S = [0,2];
const TS = subspace(eqNum, TXd, S);
registerCont({
  tag: "Top/cont/subspace-inclusion:S↪X",
  eqDom: eqNum,
  TA: TS,
  TB: TXd,
  f: inclusion(eqNum, S, X)
});

// 2) Product projections π1, π2 : X×Y -> X,Y (discrete)
const Tprod = product(eqNum, eqNum, TXd, TYd);
registerCont({
  tag: "Top/cont/proj1:X×Y→X",
  eqDom: (p:{x:number,y:number}, q:{x:number,y:number}) => p.x===q.x && p.y===q.y,
  TA: Tprod,
  TB: TXd,
  f: proj1
});
registerCont({
  tag: "Top/cont/proj2:X×Y→Y",
  eqDom: (p:{x:number,y:number}, q:{x:number,y:number}) => p.x===q.x && p.y===q.y,
  TA: Tprod,
  TB: TYd,
  f: proj2
});

// 3) Pairing ⟨f,g⟩ : Z -> X×Y (discrete)
// Note: our continuity checker uses reference equality for codomain points;
// in discrete spaces preimages are open even if empty, so this will pass.
const f = (z:number)=> (z===42? 0 : 1);
const g = (_:number)=> 20;
registerCont({
  tag: "Top/cont/pair:Z→X×Y",
  eqDom: eqNum,
  TA: TZd,
  TB: Tprod,
  f: pair(f,g)
});

// 4) Any map into indiscrete is continuous
const h = (_:number)=> 2;
registerCont({
  tag: "Top/cont/to-indiscrete:Z→Xi",
  eqDom: eqNum,
  TA: TZd,
  TB: TXi,
  f: h
});