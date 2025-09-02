/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// prisms-example.ts
import {
  Either, Left, Right, Option, Some, None,
  Prism, preview, review, over, checkPrismLaws,
  rightPrism, leftPrism, numberStringPrism
} from "../types/catkit-prisms.js";

console.log("🎯 Profunctor Prisms Demo");
console.log("=========================\n");

console.log("📊 What we're demonstrating:");
console.log("• Profunctor prisms with Choice dictionaries (Function, Forget, Tagged)");
console.log("• Generic prism constructor: prism(build, match)");
console.log("• Interpreters: preview (Forget), review (Tagged), over (Function)");
console.log("• Automatic law checking: build-match, preview-review, miss-no-op, composition fusion");
console.log();

// Example 1: Right prism on Either<string, number>
console.log("🔍 Example 1: Right Prism");
console.log("==========================");
const prR = rightPrism<string, number, number>();

const sHit: Either<string, number>  = Right(7);
const sMiss: Either<string, number> = Left("err");

console.log("Original Hit:", sHit);
console.log("Original Miss:", sMiss);
console.log("[Right prism] preview Hit:", preview(prR as any, sHit));
console.log("[Right prism] preview Miss:", preview(prR as any, sMiss));
console.log("[Right prism] review 42:", review(prR as any, 42));
console.log("[Right prism] over (+1) Hit:", over(prR as any, (n:number)=>n+1)(sHit));
console.log("[Right prism] over (+1) Miss:", over(prR as any, (n:number)=>n+1)(sMiss));

const rightLaws = checkPrismLaws(
  prR as any,
  (b:number)=> Right<string,number>(b),
  (s:Either<string,number>)=> s.tag==="right"? Right(s.right) : Left(Left<string,number>(s.left)),
  sHit, sMiss, 3, 9
);
console.log("[Right prism] laws:", rightLaws);
console.log();

// Example 2: numberStringPrism
console.log("🔍 Example 2: Number-String Prism");
console.log("==================================");
console.log("Valid number string '123':", preview(numberStringPrism as any, "123"));
console.log("Invalid number string '12x':", preview(numberStringPrism as any, "12x"));
console.log("Review number 88:", review(numberStringPrism as any, 88));
console.log("Over (*2) on '21':", over(numberStringPrism as any, (n:number)=>n*2)("21"));
console.log("Over (*2) on 'abc':", over(numberStringPrism as any, (n:number)=>n*2)("abc"));

const numStrLaws = checkPrismLaws(
  numberStringPrism as any,
  (b:number)=> String(b),
  (s:string)=> {
    const n = Number(s);
    return Number.isFinite(n)&&String(n)===s ? Right(n) : Left(s);
  },
  "5", "oops", 11, 22
);
console.log("[num<->str] laws:", numStrLaws);
console.log();

// Example 3: Left prism
console.log("🔍 Example 3: Left Prism");
console.log("=========================");
const prL = leftPrism<string, string, number>();

const leftHit: Either<string, number> = Left("error");
const leftMiss: Either<string, number> = Right(42);

console.log("Left Hit:", leftHit);
console.log("Left Miss:", leftMiss);
console.log("[Left prism] preview Hit:", preview(prL as any, leftHit));
console.log("[Left prism] preview Miss:", preview(prL as any, leftMiss));
console.log("[Left prism] review 'warn':", review(prL as any, "warn"));
console.log("[Left prism] over (s => s.toUpperCase()) Hit:", 
  over(prL as any, (s:string)=>s.toUpperCase())(leftHit));
console.log("[Left prism] over (s => s.toUpperCase()) Miss:", 
  over(prL as any, (s:string)=>s.toUpperCase())(leftMiss));

const leftLaws = checkPrismLaws(
  prL as any,
  (s:string)=> Left<string,number>(s),
  (e:Either<string,number>)=> e.tag==="left"? Right(e.left) : Left(Right<string,number>(e.right)),
  leftHit, leftMiss, "test1", "test2"
);
console.log("[Left prism] laws:", leftLaws);