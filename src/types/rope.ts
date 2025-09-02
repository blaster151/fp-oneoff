// rope.ts
// A tiny Rope built on MeasuredFingerTree with length measure.
// Operations: fromString, toString, concat, insertAt, slice.
//
// Run demo: ts-node rope-demo.ts

import { 
  Monoid, Measured, MeasuredFingerTree, 
  fromArray as ftFromArray, toArray as ftToArray, 
  pushR, concat as ftConcat, splitWith, empty 
} from "./measured-fingertree.js";

const Sum: Monoid<number> = { empty: 0, concat: (a,b)=> a+b };
const chunkMeas: Measured<string, number> = { M: Sum, measure: (s)=> s.length };

export type Rope = MeasuredFingerTree<string, number>;

export function fromString(s: string, chunkSize=1024): Rope {
  if (s.length===0) return empty(chunkMeas);
  const chunks: string[] = [];
  for (let i=0;i<s.length;i+=chunkSize) chunks.push(s.slice(i, i+chunkSize));
  return ftFromArray(chunkMeas, chunks);
}

export function toString(r: Rope): string {
  return ftToArray(r).join("");
}

export function concat(a:Rope, b:Rope): Rope { 
  return ftConcat(chunkMeas, a, b); 
}

export function insertAt(r:Rope, i:number, s:string): Rope {
  const split = splitWith(chunkMeas, r, (n)=> n>i);
  const left = split.left;
  const right = split.right;
  return concat(concat(left, fromString(s)), right);
}

export function slice(r:Rope, i:number, j:number): Rope {
  const a = splitWith(chunkMeas, r, n => n>=i);
  const leftDropped = a.right;
  const b = splitWith(chunkMeas, leftDropped, n => n>=j-i);
  return b.left;
}

export function length(r: Rope): number {
  return r.m;
}

export function charAt(r: Rope, index: number): string | undefined {
  const split = splitWith(chunkMeas, r, n => n > index);
  if (split.pivot) {
    // Find character within the pivot chunk
    const chunkStart = split.left.m;
    const relativeIndex = index - chunkStart;
    return split.pivot[relativeIndex];
  }
  return undefined;
}

/************ Rope-specific operations ************/
export function lines(r: Rope): Rope[] {
  const str = toString(r);
  const lineStrings = str.split('\n');
  return lineStrings.map(line => fromString(line));
}

export function unlines(ropes: Rope[]): Rope {
  if (ropes.length === 0) return fromString("");
  
  let result = ropes[0]!;
  for (let i = 1; i < ropes.length; i++) {
    result = concat(concat(result, fromString("\n")), ropes[i]!);
  }
  return result;
}

export function replaceAt(r: Rope, start: number, end: number, replacement: string): Rope {
  const before = slice(r, 0, start);
  const after = slice(r, end, length(r));
  return concat(concat(before, fromString(replacement)), after);
}

/************ Search operations ************/
export function indexOf(r: Rope, pattern: string): number {
  const str = toString(r); // Simplified - could be optimized
  return str.indexOf(pattern);
}

export function lastIndexOf(r: Rope, pattern: string): number {
  const str = toString(r); // Simplified - could be optimized
  return str.lastIndexOf(pattern);
}

/************ Performance utilities ************/
export function benchmarkRope(size: number): {
  construction: number;
  concatenation: number;
  insertion: number;
  slicing: number;
} {
  const testString = "x".repeat(size);
  
  // Construction
  const constructStart = performance.now();
  const rope = fromString(testString);
  const constructTime = performance.now() - constructStart;
  
  // Concatenation
  const concatStart = performance.now();
  const rope2 = fromString("y".repeat(size));
  concat(rope, rope2);
  const concatTime = performance.now() - concatStart;
  
  // Insertion
  const insertStart = performance.now();
  insertAt(rope, size / 2, "inserted");
  const insertTime = performance.now() - insertStart;
  
  // Slicing
  const sliceStart = performance.now();
  slice(rope, size / 4, 3 * size / 4);
  const sliceTime = performance.now() - sliceStart;
  
  return {
    construction: constructTime,
    concatenation: concatTime,
    insertion: insertTime,
    slicing: sliceTime
  };
}