/** @math THM-INITIAL-ALGEBRA @math DEF-CATAMORPHISM @math EX-ADT-TREE */

import { Fix, In, Out, withMap, cata } from "./adt-fix.js";
import { Sum, Inl, Inr, inl, inr, Pair, pair } from "./adt-sum-prod.js";

/** BinaryTreeF X A = A + (X × X) */
export type BinaryTreeF<X, A> = Sum<A, Pair<X, X>>;

export const LeafF = <X, A>(a: A): BinaryTreeF<X, A> =>
  withMap<BinaryTreeF<X, A>>(
    inl(a) as any, 
    _ => inl(a)
  );

export const BranchF = <X, A>(l: X, r: X): BinaryTreeF<X, A> =>
  withMap<BinaryTreeF<X, A>>(
    inr(pair(l, r)) as any, 
    (f: (x: X) => any) => inr(pair(f(l), f(r)))
  );

export type BinaryTree<A> = Fix<BinaryTreeF<any, A>>;

export const Leaf = <A>(a: A): BinaryTree<A> => In(LeafF<any, A>(a));
export const Branch = <A>(l: BinaryTree<A>, r: BinaryTree<A>): BinaryTree<A> => 
  In(BranchF<any, A>(l, r));

export const foldTree = <A, B>(onLeaf: (a: A) => B, onBranch: (l: B, r: B) => B) =>
  cata<BinaryTreeF<B, A>, B>((t: any) => 
    t._t === "inl" ? onLeaf(t.value) : onBranch(t.value.fst, t.value.snd)
  );

/**
 * Tree operations via catamorphisms
 */
export const treeSize = <A>(tree: BinaryTree<A>): number =>
  foldTree<A, number>(_ => 1, (l, r) => l + r)(tree);

export const treeHeight = <A>(tree: BinaryTree<A>): number =>
  foldTree<A, number>(_ => 0, (l, r) => 1 + Math.max(l, r))(tree);

export const treeToArray = <A>(tree: BinaryTree<A>): A[] =>
  foldTree<A, A[]>(a => [a], (l, r) => [...l, ...r])(tree);

export const mapTree = <A, B>(f: (a: A) => B): (tree: BinaryTree<A>) => BinaryTree<B> =>
  foldTree<A, BinaryTree<B>>(a => Leaf(f(a)), (l, r) => Branch(l, r));

export const filterTree = <A>(pred: (a: A) => boolean): (tree: BinaryTree<A>) => BinaryTree<A>[] =>
  foldTree<A, BinaryTree<A>[]>(
    a => pred(a) ? [Leaf(a)] : [],
    (l, r) => [...l, ...r]
  );

/**
 * Tree construction helpers
 */
export const fromArray = <A>(arr: A[]): BinaryTree<A> | null => {
  if (arr.length === 0) return null;
  if (arr.length === 1) return Leaf(arr[0]!);
  
  const mid = Math.floor(arr.length / 2);
  const left = fromArray(arr.slice(0, mid));
  const right = fromArray(arr.slice(mid + 1));
  
  if (!left && !right) return Leaf(arr[mid]!);
  if (!left) return Branch(Leaf(arr[mid]!), right!);
  if (!right) return Branch(left, Leaf(arr[mid]!));
  return Branch(Branch(left, Leaf(arr[mid]!)), right);
};

/**
 * Demonstrate BinaryTree ADT and catamorphisms
 */
export function demonstrateBinaryTreeADT() {
  console.log("🔧 BINARY TREE ADT VIA INITIAL ALGEBRA μX.A+(X×X)");
  console.log("=" .repeat(50));
  
  console.log("\\nTree Construction:");
  console.log("  • BinaryTreeF<X,A> = A + (X × X) (polynomial functor)");
  console.log("  • BinaryTree<A> = μX. BinaryTreeF<X,A> (fixpoint)");
  console.log("  • Leaf: A → BinaryTree<A> (terminal nodes)");
  console.log("  • Branch: BinaryTree<A> × BinaryTree<A> → BinaryTree<A> (internal nodes)");
  
  console.log("\\nCatamorphisms:");
  console.log("  • foldTree: ((A→B), (B×B)→B) → BinaryTree<A> → B");
  console.log("  • Structural recursion over tree shape");
  console.log("  • Principled elimination of recursive structure");
  
  console.log("\\nTree Operations:");
  console.log("  • treeSize: Count nodes via fold");
  console.log("  • treeHeight: Compute depth via fold");
  console.log("  • treeToArray: Flatten via fold");
  console.log("  • mapTree: Transform elements via fold");
  
  console.log("\\nConstruction:");
  console.log("  • fromArray: Balanced tree construction");
  console.log("  • Recursive subdivision strategy");
  
  console.log("\\n🎯 Complete BinaryTree ADT with categorical foundation!");
}