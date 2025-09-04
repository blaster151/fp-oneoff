/** HFunctor: endofunctor on Set^Set — "functor in the functor argument". 
 * Think: H maps a Set-endofunctor F to another Set-endofunctor H<F>.
 * We only need mapF on the *object parameter* X to run folds.
 */
export interface HFunctor<FNode> {
  /** fmap over the recursive positions (X) inside H<FNode,X>. */
  hmap<X,Y>(f: (x:X)=>Y, node: FNode): FNode;
}