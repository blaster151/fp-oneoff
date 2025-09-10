/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// traversal-example.ts
import { Either, Left, Right } from "../types/catkit-prisms.js";
import { lens } from "../types/catkit-optics.js";
import { prism, rightPrism } from "../types/catkit-prisms.js";
import { 
  Traversal, eachArray, bothPair, overO, setO, toListOf, previewO, viewO, composeO,
  checkTraversalIdentity, checkTraversalFusion, checkTraversalNaturality_Length, checkTraversalLinearity_Count
} from "../types/catkit-traversal.js";

console.log("🎯 Unified Optics Demo: Lens + Prism + Traversal");
console.log("================================================\n");

console.log("📊 What we're demonstrating:");
console.log("• Unified helpers that work across all optic types");
console.log("• Lens: focuses single field");
console.log("• Prism: focuses sum type branch (0 or 1 focus)");
console.log("• Traversal: focuses multiple elements (0 to n foci)");
console.log("• Composition and law checking");
console.log();

// Lens: prop 'x'
type S = { x:number, y:string };
const lx = lens<S,S,number,number>(
  s => s.x,
  (s,b)=> ({...s, x:b})
) as any;

// Prism: Right branch
const prR = rightPrism<string, number, number>() as any;

// Traversal: elements of an array
const arrTrav = eachArray as Traversal<number[], number[], number, number>;

console.log("🔍 Example 1: Lens Operations");
console.log("==============================");
const obj = {x:7, y:"hello"};
console.log("Original object:", obj);
console.log("[lens] viewO:", viewO(lx as any, obj));
console.log("[lens] overO (+10):", overO(lx as any, (n:number)=>n+10)(obj));
console.log("[lens] setO 99:", setO(lx as any, 99)(obj));
console.log("[lens] toListOf:", toListOf(lx as any, obj));
console.log();

console.log("🔍 Example 2: Prism Operations");
console.log("===============================");
const rightVal: Either<string, number> = Right(5);
const leftVal: Either<string, number> = Left("error");

console.log("Right value:", rightVal);
console.log("Left value:", leftVal);
console.log("[prism] previewO Right(5):", previewO(prR as any, rightVal));
console.log("[prism] previewO Left('error'):", previewO(prR as any, leftVal));
console.log("[prism] overO (+1) Right(5):", overO(prR as any, (n:number)=>n+1)(rightVal));
console.log("[prism] setO 99 Left('error'):", setO(prR as any, 99)(leftVal));
console.log("[prism] toListOf Right(5):", toListOf(prR as any, rightVal));
console.log("[prism] toListOf Left('error'):", toListOf(prR as any, leftVal));
console.log();

console.log("🔍 Example 3: Traversal Operations");
console.log("===================================");
const arr = [1, 2, 3, 4];
console.log("Original array:", arr);
console.log("[traversal] toListOf:", toListOf(arrTrav as any, arr));
console.log("[traversal] overO (*2):", overO(arrTrav as any, (n:number)=>n*2)(arr));
console.log("[traversal] setO 42:", setO(arrTrav as any, 42)(arr));
console.log("[traversal] previewO:", previewO(arrTrav as any, arr));
console.log();

// Compose traversal with lens: traverse array of objects focusing .x
console.log("🔍 Example 4: Composed Optics (Array of Objects → .x field)");
console.log("============================================================");
const arrOfObjs = [{x:1,y:"a"}, {x:2,y:"b"}, {x:3,y:"c"}];

const travObjsX: any =
  (dict: any) => (pab: any) =>
    dict.wander(
      (F: any) => (_ab: any) => (xs: S[]) => {
        // map each element via lens's Strong-based morphism
        const dictL = { dimap: dict.dimap, first: dict.first } as any;
        const pabL  = (lx as any)(dictL)(pab); // Star F S S

        // accumulate like eachArray
        let acc = F.of([] as S[]);
        for (const s of xs) {
          const step = pabL(s); // F S
          // acc :: F S[] ; step :: F S
          // cons :: S[] -> S -> S[]
          const cons = (ys: S[]) => (z: S) => ys.concat([z]);
          acc = F.ap(F.map(acc, cons), step);
        }
        return acc;
      },
      pab
    );

console.log("Array of objects:", arrOfObjs);
console.log("[composed] toListOf (all .x values):", toListOf(travObjsX, arrOfObjs));
console.log("[composed] overO (+1) (increment all .x):", overO(travObjsX, (n:number)=>n+1)(arrOfObjs));
console.log("[composed] setO 100 (set all .x to 100):", setO(travObjsX, 100)(arrOfObjs));
console.log();

// Pair traversal example
console.log("🔍 Example 5: Pair Traversal");
console.log("=============================");
const pair: [number, number] = [10, 20];
const pairTrav = bothPair<number, number, number, number>() as any;

console.log("Original pair:", pair);
console.log("[pair] toListOf:", toListOf(pairTrav, pair));
console.log("[pair] overO (*3):", overO(pairTrav, (n:number)=>n*3)(pair));
console.log("[pair] setO 555:", setO(pairTrav, 555)(pair));
console.log();

// Laws checks
console.log("🔍 Example 6: Traversal Laws");
console.log("============================");
const testArr = [1, 2, 3];
const f = (n:number)=> n+1;
const g = (n:number)=> n*3;

console.log("Test array:", testArr);
console.log("[laws] Identity:", checkTraversalIdentity(arrTrav as any, testArr));
console.log("[laws] Fusion:", checkTraversalFusion(arrTrav as any, testArr, f, g));
console.log("[laws] Naturality (length):", checkTraversalNaturality_Length(arrTrav as any, testArr));
console.log("[laws] Linearity (count):", checkTraversalLinearity_Count(arrTrav as any, testArr));
console.log();

console.log("🎯 All unified helpers work seamlessly across Lens, Prism, and Traversal!");
console.log("• overO/setO: modify through any optic");
console.log("• toListOf: collect all foci (1 for lens, 0-1 for prism, 0-n for traversal)");
console.log("• previewO: safely get first focus");
console.log("• viewO: get exactly-one focus (lens-style)");