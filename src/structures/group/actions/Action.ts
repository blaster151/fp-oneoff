import { FiniteGroup } from "../Group";

export type Action<G,X> = {
  G: FiniteGroup<G>;
  X: { elems: X[]; eq:(x:X,y:X)=>boolean; };
  act: (g:G, x:X)=>X;
};

export function isAction<G,X>(A: Action<G,X>): boolean {
  const { G, X, act } = A;
  for (const x of X.elems) {
    if (!X.eq(act(G.id, x), x)) return false;
  }
  for (const g of G.elems) for (const h of G.elems) for (const x of X.elems) {
    if (!X.eq(act(G.op(g,h), x), act(g, act(h, x)))) return false;
  }
  return true;
}

/** Left-regular action: G acts on itself by left multiplication. */
export function leftRegular<G>(G: FiniteGroup<G>): Action<G,G> {
  return { G, X:{ elems:G.elems, eq:G.eq }, act:(g,x)=> G.op(g,x) };
}

/** Conjugation action: G acts on itself by g⋅x = gxg^{-1}. */
export function conjugation<G>(G: FiniteGroup<G>): Action<G,G> {
  return { G, X:{ elems:G.elems, eq:G.eq }, act:(g,x)=> G.op(G.op(g,x), G.inv(g)) };
}