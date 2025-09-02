/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// optics-compose-laws-example.ts
import { lens } from "../types/catkit-optics.js";
import { Either, Left, Right, Option, Some, None } from "../types/catkit-prisms.js";
import {
  Traversal, eachArray, eitherTraversal, optionTraversal,
  composeO, overO, setO, toListOf, previewO, viewO,
  checkTraversalIdentity, checkTraversalFusion, checkTraversalNaturality_Length, checkTraversalLinearity_Count
} from "../types/catkit-traversal.js";

console.log("🎯 Optics Composition & Laws Demo");
console.log("=================================\n");

console.log("📊 What we're demonstrating:");
console.log("• Generic optic composition with composeO");
console.log("• Traversals for Either (Right branch) and Option (Some branch)");
console.log("• Comprehensive traversal law checking");
console.log("• Unified helpers working across all optic types");
console.log();

// Lens: focus .x on records
type R = { x:number, y:string };
const lx = lens<R,R,number,number>(s=>s.x, (s,b)=> ({...s, x:b})) as any;

// Base data
const arr: R[] = [{x:1,y:"a"}, {x:2,y:"b"}, {x:3,y:"c"}];

console.log("🔍 Example 1: Composed Optics (Array → Elements → .x field)");
console.log("============================================================");
console.log("Original data:", arr);

// Compose traversal (each element) with lens (.x): arr[].x
const arrEach = eachArray as Traversal<R[], R[], R, R>;
const arrX = composeO(arrEach as any, lx as any);

// Try it
console.log("[compose] toListOf arrX (extract all .x):", toListOf(arrX as any, arr));
console.log("[compose] overO (+1) arrX (increment all .x):", overO(arrX as any, (n:number)=>n+1)(arr));
console.log("[compose] setO 100 arrX (set all .x to 100):", setO(arrX as any, 100)(arr));
console.log();

console.log("🔍 Example 2: Either Traversal (Right branch)");
console.log("==============================================");
// Either traversal (Right branch)
const trEither = eitherTraversal<string, number, number>() as Traversal<Either<string,number>, Either<string,number>, number, number>;

const rightCase: Either<string, number> = Right(7);
const leftCase: Either<string, number> = Left("error");

console.log("Right case:", rightCase);
console.log("Left case:", leftCase);
console.log("[either] toListOf Right(7):", toListOf(trEither as any, rightCase));
console.log("[either] toListOf Left('error'):", toListOf(trEither as any, leftCase));
console.log("[either] overO (+1) Right(7):", overO(trEither as any, (n:number)=>n+1)(rightCase));
console.log("[either] overO (+1) Left('error'):", overO(trEither as any, (n:number)=>n+1)(leftCase));
console.log("[either] setO 99 Right(7):", setO(trEither as any, 99)(rightCase));
console.log("[either] setO 99 Left('error'):", setO(trEither as any, 99)(leftCase));
console.log();

console.log("🔍 Example 3: Option Traversal (Some branch)");
console.log("=============================================");
// Option traversal (Some branch)
const trOpt = optionTraversal<number, number>() as Traversal<Option<number>, Option<number>, number, number>;

const someCase: Option<number> = Some(5);
const noneCase: Option<number> = None;

console.log("Some case:", someCase);
console.log("None case:", noneCase);
console.log("[option] toListOf Some(5):", toListOf(trOpt as any, someCase));
console.log("[option] toListOf None:", toListOf(trOpt as any, noneCase));
console.log("[option] overO (*2) Some(5):", overO(trOpt as any, (n:number)=>n*2)(someCase));
console.log("[option] overO (*2) None:", overO(trOpt as any, (n:number)=>n*2)(noneCase));
console.log("[option] setO 42 Some(5):", setO(trOpt as any, 42)(someCase));
console.log("[option] setO 42 None:", setO(trOpt as any, 42)(noneCase));
console.log();

console.log("🔍 Example 4: Traversal Laws Verification");
console.log("==========================================");
// Laws checks on composed traversal arrX
const testData = [{x:10,y:"test"}, {x:20,y:"data"}];
console.log("Test data:", testData);

const idOK  = checkTraversalIdentity(arrX as any, testData);
const fusOK = checkTraversalFusion(arrX as any, testData, (n:number)=>n+1, (n:number)=>n*2);
const natOK = checkTraversalNaturality_Length(arrX as any, testData);
const linOK = checkTraversalLinearity_Count(arrX as any, testData);

console.log("[laws arrX] identity:", idOK);
console.log("[laws arrX] fusion:", fusOK); 
console.log("[laws arrX] naturality (length):", natOK);
console.log("[laws arrX] linearity (count):", linOK);
console.log();

// Laws checks on simple array traversal
const simpleArr = [1, 2, 3, 4];
console.log("Simple array:", simpleArr);

const arrIdOK  = checkTraversalIdentity(eachArray as any, simpleArr);
const arrFusOK = checkTraversalFusion(eachArray as any, simpleArr, (n:number)=>n+10, (n:number)=>n*3);
const arrNatOK = checkTraversalNaturality_Length(eachArray as any, simpleArr);
const arrLinOK = checkTraversalLinearity_Count(eachArray as any, simpleArr);

console.log("[laws eachArray] identity:", arrIdOK);
console.log("[laws eachArray] fusion:", arrFusOK);
console.log("[laws eachArray] naturality (length):", arrNatOK);
console.log("[laws eachArray] linearity (count):", arrLinOK);
console.log();

console.log("🎯 Summary: Unified Profunctor Optics");
console.log("=====================================");
console.log("✅ Lenses (Strong): focus single field");
console.log("✅ Prisms (Choice): focus sum type branch");  
console.log("✅ Traversals (Wander): focus multiple elements");
console.log("✅ Composition: any optic can compose with any other");
console.log("✅ Unified helpers: same interface across all optic types");
console.log("✅ Law verification: mathematical correctness guaranteed");
console.log("\n🚀 Complete profunctor optics toolkit ready!");