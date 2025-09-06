import { Group, GroupHom, Subgroup } from "./structures";

function eqDefault<T>(a:T,b:T){ return Object.is(a,b); }

export interface GroupHomWitnesses<A,B> {
  preservesOp: boolean;
  preservesId: boolean;
  preservesInv: boolean;
  imageSubgroup?: Subgroup<B>;
  kernelSubgroup?: Subgroup<A>;
}

export function analyzeGroupHom<A,B>(f: GroupHom<A,B>): GroupHom<A,B> {
  const G = f.source, H = f.target;
  const eqH = H.eq ?? eqDefault;
  const eqG = G.eq ?? eqDefault;

  const preservesId = eqH(f.map((G as any).e ?? (G as any).id), (H as any).e ?? (H as any).id);
  const preservesInv = G.elems.every(g => eqH(f.map(G.inv(g)), H.inv(f.map(g))));
  const preservesOp = G.elems.every(g1 => G.elems.every(g2 =>
    eqH(f.map(G.op(g1,g2)), H.op(f.map(g1), f.map(g2)))
  ));

  const imageElems: B[] = [];
  for (const g of G.elems) {
    const h = f.map(g);
    if (!imageElems.some(x => eqH(x,h))) imageElems.push(h);
  }
  const imageSubgroup: Subgroup<B> = {
    name: f.name ? `im(${f.name})` : "im(f)",
    elems: imageElems,
    op: H.op, e: (H as any).e ?? (H as any).id, inv: H.inv, eq: H.eq,
  };

  const kernelElems: A[] = [];
  for (const g of G.elems) {
    if (eqH(f.map(g), (H as any).e ?? (H as any).id)) kernelElems.push(g);
  }
  const kernelSubgroup: Subgroup<A> = {
    name: f.name ? `ker(${f.name})` : "ker(f)",
    elems: kernelElems,
    op: G.op, e: (G as any).e ?? (G as any).id, inv: G.inv, eq: G.eq,
  };

  (f as any).witnesses = { preservesId, preservesInv, preservesOp, imageSubgroup, kernelSubgroup } as GroupHomWitnesses<A,B>;
  return f;
}