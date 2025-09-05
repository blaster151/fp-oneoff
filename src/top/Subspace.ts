import { Top } from "./Topology";

/** Subspace topology: given T on X and S ⊆ X, opens are {U∩S | U open in X}. */
export function subspace<X>(eqX:(a:X,b:X)=>boolean, T: Top<X>, S: X[]): Top<X> {
  const carrier = S.slice();
  const opens: X[][] = [];
  const inter = (U:X[],V:X[]) => U.filter(u => V.some(v=>eqX(u,v)));
  for (const U of T.opens) {
    const UiS = inter(U, S);
    if (!opens.some(W => W.length===UiS.length && UiS.every(x => W.some(y=>eqX(x,y))))) {
      opens.push(UiS);
    }
  }
  return { carrier, opens };
}