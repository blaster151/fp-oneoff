import { FiniteAbGroup } from "../AbGroup";
import { PairingScheme } from "../../group/pairing/PairingScheme";
import { productGroup } from "../../group/builders/Product";
import { GroupHom } from "../../group/GrpCat";

/** Biproduct data (G ⊕ H, i1,i2,p1,p2) with standard identities. */
export function biproduct<A,B,O>(
  G: FiniteAbGroup<A>, H: FiniteAbGroup<B>, S: PairingScheme<A,B,O>
): {
  GH: FiniteAbGroup<O>,
  i1: GroupHom<A,O>, i2: GroupHom<B,O>,
  p1: GroupHom<O,A>, p2: GroupHom<O,B>
} {
  const GH = productGroup(G, H, S) as FiniteAbGroup<O>;
  const i1: GroupHom<A,O> = { source:G, target:GH, f:(a:A)=> S.pair(a, H.id), verify: () => true };
  const i2: GroupHom<B,O> = { source:H, target:GH, f:(b:B)=> S.pair(G.id, b), verify: () => true };
  const p1: GroupHom<O,A> = { source:GH, target:G, f:(o:O)=> S.left(o), verify: () => true };
  const p2: GroupHom<O,B> = { source:GH, target:H, f:(o:O)=> S.right(o), verify: () => true };
  return { GH, i1, i2, p1, p2 };
}