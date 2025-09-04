/**
 * Higher-order fixpoint with a *node-local* hfmap (like withMap for F),
 * so we can run higher-order folds (hcata) without exposing scary kinds.
 *
 * Intuition:
 *   - A node of "higher-order functor" F<G, A> may contain *G* at recursive
 *     positions. We store, on each node, a function that can map a natural
 *     transformation nt : G ~> H across those positions, producing F<H, A>.
 *
 * API:
 *   withHMap(node, map)       -- attach node-local higher-order fmap
 *   hmapH(nt, node)           -- apply that mapper
 *   HFix<F,A> / Hin / Hout    -- higher-order fixpoint carrier
 *   hcata(alg)                -- catamorphism: folds HFix<F, A> -> R uniformly in A
 */

const HMAP = Symbol("HFMAP");

// Attach a higher-order mapper to a node.
// map: (nt) => mapped-node   where nt maps G<X> -> H<X> at all occurrences.
export function withHMap<FNode>(node: unknown, map: (nt: (gx: any) => any) => FNode): FNode {
  Object.defineProperty(node as object, HMAP, { value: map, enumerable: false });
  return node as FNode;
}

// Apply the stored higher-order mapper on a node.
export function hmapH<FNode>(nt: (gx: any) => any, node: FNode): FNode {
  const m = (node as any)[HMAP];
  if (typeof m !== "function") throw new Error("H-node missing HFMAP; construct with withHMap(...)");
  return m(nt);
}

// Higher-order fixpoint: HFix<F, A> ~ In (F<HFix<F, _>, A>)
export type HFix<FNode, A> = { readonly _tag: "HFix"; readonly out: FNode; readonly index?: A };
export const Hin  = <FNode, A>(out: FNode, index?: A): HFix<FNode, A> => ({ _tag: "HFix", out, index } as HFix<FNode, A>);
export const Hout = <FNode, A>(t: HFix<FNode, A>): FNode => t.out;

// Algebra for higher-order catamorphism: replace the functor parameter G by result type R.
export type HAlgebra<FNode, R> = (fr: FNode) => R;

/**
 * Higher-order catamorphism.
 * alg expects a node where all recursive positions (originally G<...>) have been
 * replaced by the *result type R*. We achieve that by hmapH with nt = go.
 */
export const hcata = <FNode, R>(alg: HAlgebra<FNode, R>) => {
  const go = <A>(t: HFix<FNode, A>): R => {
    const fr: FNode = Hout<FNode, A>(t);                // F<G=HFix, A>
    // Map the natural transformation nt: HFix<F, X> -> R over all G-occurrences.
    const frR: FNode = hmapH<FNode>((child: HFix<FNode, any>) => go(child), fr) as FNode; // F<R, A>
    return alg(frR);
  };
  return go;
};