/** @math THM-INITIAL-ALGEBRA @math DEF-CATAMORPHISM */

import { describe, it, expect } from "vitest";
import { List, Nil, Cons, toArray, fromArray, foldRight, foldLeft, length, map, filter, append, demonstrateListADT } from "../adt-list.js";
import { BinaryTree, Leaf, Branch, foldTree, treeSize, treeHeight, treeToArray, mapTree, demonstrateBinaryTreeADT } from "../adt-tree.js";
import { match, matchPartial, tagGuard, demonstratePatternMatching } from "../adt-match.js";

describe("ADT: List via μX.1+(A×X)", () => {
  it("roundtrip array <-> List", () => {
    const xs = fromArray([1, 2, 3]);
    expect(toArray(xs)).toEqual([1, 2, 3]);
    
    const empty = fromArray([]);
    expect(toArray(empty)).toEqual([]);
    
    console.log("✅ List array roundtrip verified");
  });

  it("foldRight computes sum", () => {
    const xs = fromArray([1, 2, 3, 4]);
    const sum = foldRight<number, number>(0, (a, b) => a + b)(xs);
    expect(sum).toBe(10);
    
    console.log("✅ foldRight sum: [1,2,3,4] → 10");
  });

  it("foldLeft computes product", () => {
    const xs = fromArray([2, 3, 4]);
    const prod = foldLeft<number, number>(1, (b, a) => b * a)(xs);
    expect(prod).toBe(24);
    
    console.log("✅ foldLeft product: [2,3,4] → 24");
  });

  it("list operations work via catamorphisms", () => {
    const xs = fromArray([1, 2, 3, 4, 5]);
    
    // Length
    expect(length(xs)).toBe(5);
    
    // Map
    const doubled = map<number, number>(x => x * 2)(xs);
    expect(toArray(doubled)).toEqual([2, 4, 6, 8, 10]);
    
    // Filter
    const evens = filter<number>(x => x % 2 === 0)(xs);
    expect(toArray(evens)).toEqual([2, 4]);
    
    // Append
    const ys = fromArray([6, 7]);
    const combined = append(xs, ys);
    expect(toArray(combined)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    
    console.log("✅ List operations: length, map, filter, append all working");
  });

  it("demonstrates complete List ADT", () => {
    demonstrateListADT();
    expect(true).toBe(true); // Educational demonstration
  });
});

describe("ADT: BinaryTree via μX.A+(X×X)", () => {
  it("foldTree computes size", () => {
    const t: BinaryTree<number> = Branch(Leaf(1), Branch(Leaf(2), Leaf(3)));
    const size = foldTree<number, number>(_ => 1, (l, r) => l + r)(t);
    expect(size).toBe(3);
    
    console.log("✅ Tree size: 3 nodes via foldTree");
  });

  it("tree operations work via catamorphisms", () => {
    const t: BinaryTree<string> = Branch(
      Leaf("a"),
      Branch(Leaf("b"), Branch(Leaf("c"), Leaf("d")))
    );
    
    // Size
    expect(treeSize(t)).toBe(4);
    
    // Height
    expect(treeHeight(t)).toBe(3); // Root is height 0, deepest leaf is height 3
    
    // To array (in-order traversal)
    const arr = treeToArray(t);
    expect(arr).toEqual(["a", "b", "c", "d"]);
    
    // Map
    const upperTree = mapTree<string, string>(s => s.toUpperCase())(t);
    const upperArr = treeToArray(upperTree);
    expect(upperArr).toEqual(["A", "B", "C", "D"]);
    
    console.log("✅ Tree operations: size=4, height=3, map working");
  });

  it("demonstrates complete BinaryTree ADT", () => {
    demonstrateBinaryTreeADT();
    expect(true).toBe(true); // Educational demonstration
  });
});

describe("Pattern matching for ADTs", () => {
  it("exhaustive matching works for Option-like types", () => {
    type TestOption<A> = { _t: "none" } | { _t: "some"; value: A };
    
    const none: TestOption<number> = { _t: "none" };
    const some: TestOption<number> = { _t: "some", value: 42 };
    
    const result1 = match(none, {
      none: (_: any) => "empty",
      some: (x: any) => `value: ${x.value}`
    } as any);
    expect(result1).toBe("empty");
    
    const result2 = match(some, {
      none: (_: any) => "empty",  
      some: (x: any) => `value: ${x.value}`
    } as any);
    expect(result2).toBe("value: 42");
    
    console.log("✅ Exhaustive pattern matching working");
  });

  it("partial matching with default works", () => {
    type TestSum = { _t: "a"; x: number } | { _t: "b"; y: string } | { _t: "c"; z: boolean };
    
    const testA: TestSum = { _t: "a", x: 123 };
    const testC: TestSum = { _t: "c", z: true };
    
    const result1 = matchPartial(testA, 
      { a: (x: any) => `number: ${x.x}` } as any,
      (_: any) => "other"
    );
    expect(result1).toBe("number: 123");
    
    const result2 = matchPartial(testC,
      { a: (x: any) => `number: ${x.x}` } as any,
      (_: any) => "other"
    );
    expect(result2).toBe("other");
    
    console.log("✅ Partial pattern matching with default working");
  });

  it("type guards work correctly", () => {
    type TestSum = { _t: "left"; value: string } | { _t: "right"; value: number };
    
    const isLeft = tagGuard<TestSum, "left">("left");
    const isRight = tagGuard<TestSum, "right">("right");
    
    const leftVal: TestSum = { _t: "left", value: "hello" };
    const rightVal: TestSum = { _t: "right", value: 42 };
    
    expect(isLeft(leftVal)).toBe(true);
    expect(isLeft(rightVal)).toBe(false);
    expect(isRight(leftVal)).toBe(false);
    expect(isRight(rightVal)).toBe(true);
    
    // Type narrowing should work
    if (isLeft(leftVal)) {
      expect(leftVal.value).toBe("hello"); // TypeScript knows this is string
    }
    
    console.log("✅ Type guards and type narrowing working");
  });

  it("demonstrates complete pattern matching system", () => {
    demonstratePatternMatching();
    expect(true).toBe(true); // Educational demonstration
  });
});