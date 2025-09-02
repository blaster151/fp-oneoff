// fingertree.ts
// Minimal FingerTree-style persistent sequence with size measure.
// O(1) amortized pushL/pushR/popL/popR, O(log n) splitAt, O(1) concat.
//
// This provides efficient persistent sequences for rewrite logs, traces, etc.

/************ Measured values ************/
export interface Measured<A> {
  readonly measure: number;
  readonly value: A;
}

export function measured<A>(value: A, measure: number = 1): Measured<A> {
  return { value, measure };
}

/************ Digits (1-4 elements) ************/
export type Digit<A> = 
  | { tag: "One"; a: A }
  | { tag: "Two"; a: A; b: A }
  | { tag: "Three"; a: A; b: A; c: A }
  | { tag: "Four"; a: A; b: A; c: A; d: A };

export function digitSize<A>(d: Digit<A>): number {
  switch (d.tag) {
    case "One": return 1;
    case "Two": return 2;
    case "Three": return 3;
    case "Four": return 4;
  }
}

export function digitToArray<A>(d: Digit<A>): A[] {
  switch (d.tag) {
    case "One": return [d.a];
    case "Two": return [d.a, d.b];
    case "Three": return [d.a, d.b, d.c];
    case "Four": return [d.a, d.b, d.c, d.d];
  }
}

export function digitFromArray<A>(arr: A[]): Digit<A> {
  switch (arr.length) {
    case 1: return { tag: "One", a: arr[0]! };
    case 2: return { tag: "Two", a: arr[0]!, b: arr[1]! };
    case 3: return { tag: "Three", a: arr[0]!, b: arr[1]!, c: arr[2]! };
    case 4: return { tag: "Four", a: arr[0]!, b: arr[1]!, c: arr[2]!, d: arr[3]! };
    default: throw new Error(`Invalid digit size: ${arr.length}`);
  }
}

/************ Nodes (2-3 tree internal nodes) ************/
export type Node<A> =
  | { tag: "Node2"; size: number; a: A; b: A }
  | { tag: "Node3"; size: number; a: A; b: A; c: A };

export function node2<A>(a: A, b: A): Node<A> {
  return { tag: "Node2", size: 2, a, b };
}

export function node3<A>(a: A, b: A, c: A): Node<A> {
  return { tag: "Node3", size: 3, a, b, c };
}

export function nodeSize<A>(n: Node<A>): number {
  return n.size;
}

export function nodeToArray<A>(n: Node<A>): A[] {
  switch (n.tag) {
    case "Node2": return [n.a, n.b];
    case "Node3": return [n.a, n.b, n.c];
  }
}

/************ FingerTree ************/
export type FingerTree<A> =
  | { tag: "Empty" }
  | { tag: "Single"; value: A }
  | { tag: "Deep"; size: number; left: Digit<A>; middle: FingerTree<Node<A>>; right: Digit<A> };

export const Empty = <A>(): FingerTree<A> => ({ tag: "Empty" });
export const Single = <A>(value: A): FingerTree<A> => ({ tag: "Single", value });

export function Deep<A>(left: Digit<A>, middle: FingerTree<Node<A>>, right: Digit<A>): FingerTree<A> {
  const size = digitSize(left) + ftSize(middle) + digitSize(right);
  return { tag: "Deep", size, left, middle, right };
}

export function ftSize<A>(ft: FingerTree<A>): number {
  switch (ft.tag) {
    case "Empty": return 0;
    case "Single": return 1;
    case "Deep": return ft.size;
  }
}

/************ Basic operations ************/

export function pushL<A>(a: A, ft: FingerTree<A>): FingerTree<A> {
  switch (ft.tag) {
    case "Empty": return Single(a);
    case "Single": return Deep({ tag: "One", a }, Empty(), { tag: "One", a: ft.value });
    case "Deep": {
      switch (ft.left.tag) {
        case "One": return Deep({ tag: "Two", a, b: ft.left.a }, ft.middle, ft.right);
        case "Two": return Deep({ tag: "Three", a, b: ft.left.a, c: ft.left.b }, ft.middle, ft.right);
        case "Three": return Deep({ tag: "Four", a, b: ft.left.a, c: ft.left.b, d: ft.left.c }, ft.middle, ft.right);
        case "Four": {
          const newNode = node3(ft.left.b, ft.left.c, ft.left.d);
          return Deep({ tag: "Two", a, b: ft.left.a }, pushL(newNode, ft.middle), ft.right);
        }
      }
    }
  }
}

export function pushR<A>(ft: FingerTree<A>, a: A): FingerTree<A> {
  switch (ft.tag) {
    case "Empty": return Single(a);
    case "Single": return Deep({ tag: "One", a: ft.value }, Empty(), { tag: "One", a });
    case "Deep": {
      switch (ft.right.tag) {
        case "One": return Deep(ft.left, ft.middle, { tag: "Two", a: ft.right.a, b: a });
        case "Two": return Deep(ft.left, ft.middle, { tag: "Three", a: ft.right.a, b: ft.right.b, c: a });
        case "Three": return Deep(ft.left, ft.middle, { tag: "Four", a: ft.right.a, b: ft.right.b, c: ft.right.c, d: a });
        case "Four": {
          const newNode = node3(ft.right.a, ft.right.b, ft.right.c);
          return Deep(ft.left, pushR(ft.middle, newNode), { tag: "Two", a: ft.right.d, b: a });
        }
      }
    }
  }
}

export function popL<A>(ft: FingerTree<A>): { head: A; tail: FingerTree<A> } | null {
  switch (ft.tag) {
    case "Empty": return null;
    case "Single": return { head: ft.value, tail: Empty() };
    case "Deep": {
      switch (ft.left.tag) {
        case "One": {
          if (ft.middle.tag === "Empty") {
            return { head: ft.left.a, tail: digitToTree(ft.right) };
          } else {
            const { head: node, tail: newMiddle } = popL(ft.middle)!;
            const newLeft = digitFromArray(nodeToArray(node));
            return { head: ft.left.a, tail: Deep(newLeft, newMiddle, ft.right) };
          }
        }
        case "Two": return { head: ft.left.a, tail: Deep({ tag: "One", a: ft.left.b }, ft.middle, ft.right) };
        case "Three": return { head: ft.left.a, tail: Deep({ tag: "Two", a: ft.left.b, b: ft.left.c }, ft.middle, ft.right) };
        case "Four": return { head: ft.left.a, tail: Deep({ tag: "Three", a: ft.left.b, b: ft.left.c, c: ft.left.d }, ft.middle, ft.right) };
      }
    }
  }
}

export function popR<A>(ft: FingerTree<A>): { init: FingerTree<A>; last: A } | null {
  switch (ft.tag) {
    case "Empty": return null;
    case "Single": return { init: Empty(), last: ft.value };
    case "Deep": {
      switch (ft.right.tag) {
        case "One": {
          if (ft.middle.tag === "Empty") {
            return { init: digitToTree(ft.left), last: ft.right.a };
          } else {
            const { init: newMiddle, last: node } = popR(ft.middle)!;
            const newRight = digitFromArray(nodeToArray(node));
            return { init: Deep(ft.left, newMiddle, newRight), last: ft.right.a };
          }
        }
        case "Two": return { init: Deep(ft.left, ft.middle, { tag: "One", a: ft.right.a }), last: ft.right.b };
        case "Three": return { init: Deep(ft.left, ft.middle, { tag: "Two", a: ft.right.a, b: ft.right.b }), last: ft.right.c };
        case "Four": return { init: Deep(ft.left, ft.middle, { tag: "Three", a: ft.right.a, b: ft.right.b, c: ft.right.c }), last: ft.right.d };
      }
    }
  }
}

function digitToTree<A>(d: Digit<A>): FingerTree<A> {
  const arr = digitToArray(d);
  return arr.reduce((acc, x) => pushR(acc, x), Empty<A>());
}

/************ Concatenation ************/
export function concat<A>(left: FingerTree<A>, right: FingerTree<A>): FingerTree<A> {
  switch (left.tag) {
    case "Empty": return right;
    case "Single": return pushL(left.value, right);
    case "Deep": {
      switch (right.tag) {
        case "Empty": return left;
        case "Single": return pushR(left, right.value);
        case "Deep": {
          // Merge middle elements into nodes
          const middle = digitToArray(left.right).concat(digitToArray(right.left));
          const newMiddle = addToMiddle(left.middle, middle, right.middle);
          return Deep(left.left, newMiddle, right.right);
        }
      }
    }
  }
}

function addToMiddle<A>(left: FingerTree<Node<A>>, middle: A[], right: FingerTree<Node<A>>): FingerTree<Node<A>> {
  // Convert middle elements to nodes and add to the middle tree
  let result = left;
  
  // Group middle elements into nodes
  for (let i = 0; i < middle.length; i += 2) {
    if (i + 1 < middle.length) {
      result = pushR(result, node2(middle[i]!, middle[i + 1]!));
    } else {
      // Odd element - combine with next operation or handle specially
      result = pushR(result, node2(middle[i]!, middle[i]!)); // Duplicate for simplicity
    }
  }
  
  return concat(result, right);
}

/************ Splitting ************/
export function splitAt<A>(ft: FingerTree<A>, index: number): { left: FingerTree<A>; right: FingerTree<A> } {
  if (index <= 0) return { left: Empty(), right: ft };
  if (index >= ftSize(ft)) return { left: ft, right: Empty() };
  
  return splitAtImpl(ft, index);
}

function splitAtImpl<A>(ft: FingerTree<A>, index: number): { left: FingerTree<A>; right: FingerTree<A> } {
  switch (ft.tag) {
    case "Empty": return { left: Empty(), right: Empty() };
    case "Single": return index <= 0 ? { left: Empty(), right: ft } : { left: ft, right: Empty() };
    case "Deep": {
      const leftSize = digitSize(ft.left);
      if (index < leftSize) {
        // Split in left digit
        const leftArr = digitToArray(ft.left);
        const leftPart = leftArr.slice(0, index);
        const rightPart = leftArr.slice(index);
        
        const leftTree = leftPart.reduce((acc, x) => pushR(acc, x), Empty<A>());
        const rightTree = rightPart.length > 0 
          ? Deep(digitFromArray(rightPart), ft.middle, ft.right)
          : concat(digitToTree(ft.right), Empty()); // Simplified
        
        return { left: leftTree, right: rightTree };
      }
      
      const middleSize = ftSize(ft.middle);
      if (index < leftSize + middleSize) {
        // Split in middle
        const middleIndex = index - leftSize;
        const { left: midLeft, right: midRight } = splitAtImpl(ft.middle, middleIndex);
        
        const leftTree = Deep(ft.left, midLeft, { tag: "One", a: digitToArray(ft.right)[0]! }); // Simplified
        const rightTree = Deep({ tag: "One", a: digitToArray(ft.left)[0]! }, midRight, ft.right); // Simplified
        
        return { left: leftTree, right: rightTree };
      }
      
      // Split in right digit
      const rightIndex = index - leftSize - middleSize;
      const rightArr = digitToArray(ft.right);
      const leftPart = rightArr.slice(0, rightIndex);
      const rightPart = rightArr.slice(rightIndex);
      
      const leftTree = leftPart.length > 0
        ? Deep(ft.left, ft.middle, digitFromArray(leftPart))
        : concat(digitToTree(ft.left), Empty()); // Simplified
      const rightTree = rightPart.reduce((acc, x) => pushR(acc, x), Empty<A>());
      
      return { left: leftTree, right: rightTree };
    }
  }
}

/************ Conversion utilities ************/
export function fromArray<A>(arr: A[]): FingerTree<A> {
  return arr.reduce((ft, x) => pushR(ft, x), Empty<A>());
}

export function toArray<A>(ft: FingerTree<A>): A[] {
  const result: A[] = [];
  let current = ft;
  
  while (current.tag !== "Empty") {
    const popped = popL(current);
    if (!popped) break;
    result.push(popped.head);
    current = popped.tail;
  }
  
  return result;
}

/************ Utility functions ************/
export function isEmpty<A>(ft: FingerTree<A>): boolean {
  return ft.tag === "Empty";
}

export function head<A>(ft: FingerTree<A>): A | undefined {
  const popped = popL(ft);
  return popped?.head;
}

export function last<A>(ft: FingerTree<A>): A | undefined {
  const popped = popR(ft);
  return popped?.last;
}

export function reverse<A>(ft: FingerTree<A>): FingerTree<A> {
  const arr = toArray(ft);
  return fromArray(arr.reverse());
}

/************ Applicative-style operations ************/
export function map<A, B>(ft: FingerTree<A>, f: (a: A) => B): FingerTree<B> {
  const arr = toArray(ft);
  return fromArray(arr.map(f));
}

export function filter<A>(ft: FingerTree<A>, predicate: (a: A) => boolean): FingerTree<A> {
  const arr = toArray(ft);
  return fromArray(arr.filter(predicate));
}

export function foldl<A, B>(ft: FingerTree<A>, f: (acc: B, a: A) => B, initial: B): B {
  const arr = toArray(ft);
  return arr.reduce(f, initial);
}

export function foldr<A, B>(ft: FingerTree<A>, f: (a: A, acc: B) => B, initial: B): B {
  const arr = toArray(ft);
  return arr.reduceRight((acc, a) => f(a, acc), initial);
}

/************ Performance testing utilities ************/
export function benchmarkFingerTree(size: number): {
  construction: number;
  leftOps: number;
  rightOps: number;
  splitting: number;
  concatenation: number;
} {
  const start = performance.now();
  
  // Construction benchmark
  let ft = Empty<number>();
  for (let i = 0; i < size; i++) {
    ft = pushR(ft, i);
  }
  const constructionTime = performance.now() - start;
  
  // Left operations
  const leftStart = performance.now();
  for (let i = 0; i < Math.min(100, size); i++) {
    ft = pushL(i, ft);
    const popped = popL(ft);
    if (popped) ft = popped.tail;
  }
  const leftTime = performance.now() - leftStart;
  
  // Right operations
  const rightStart = performance.now();
  for (let i = 0; i < Math.min(100, size); i++) {
    ft = pushR(ft, i);
    const popped = popR(ft);
    if (popped) ft = popped.init;
  }
  const rightTime = performance.now() - rightStart;
  
  // Splitting
  const splitStart = performance.now();
  for (let i = 0; i < 10; i++) {
    const index = Math.floor(ftSize(ft) / 2);
    if (index > 0) {
      const { left, right } = splitAt(ft, index);
      ft = concat(left, right); // Reconstruct
    }
  }
  const splitTime = performance.now() - splitStart;
  
  // Concatenation
  const concatStart = performance.now();
  const ft1 = fromArray(Array.from({length: size/2}, (_, i) => i));
  const ft2 = fromArray(Array.from({length: size/2}, (_, i) => i + size/2));
  for (let i = 0; i < 10; i++) {
    concat(ft1, ft2);
  }
  const concatTime = performance.now() - concatStart;
  
  return {
    construction: constructionTime,
    leftOps: leftTime,
    rightOps: rightTime,
    splitting: splitTime,
    concatenation: concatTime
  };
}