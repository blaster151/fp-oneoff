import { describe, it, expect } from "vitest";
import { Z2, Z3 } from "../util/FiniteGroups";
import { tupleScheme, indexScheme } from "../pairing/PairingScheme";
import { productGroup } from "../builders/Product";
import { isIsomorphism } from "../Isomorphism";

describe("Product groups via different pairing schemes are isomorphic", () => {
  const G = Z2, H = Z3;

  const S1 = tupleScheme<number, number>();
  const K1 = productGroup(G, H, S1);

  const S2 = indexScheme(G.elems, H.elems);
  const K2 = productGroup(G, H, S2);

  it("sizes & identities", () => {
    expect(K1.elems.length).toBe(6);
    expect(K2.elems.length).toBe(6);
    // check a sample product in K1: (1,2) + (1,1) = (0,0) mod componentwise
    const a = S1.pair(1, 2);
    const b = S1.pair(1, 1);
    const c = K1.op(a, b);
    expect(K1.eq(c, S1.pair(0, 0))).toBe(true);
  });

  it("isomorphism j: K1 → K2 by transporting along the two schemes", () => {
    // j = encode using S2 after decoding with S1
    const j = (o: ReturnType<typeof S1["pair"]>) => S2.pair(S1.left(o), S1.right(o));

    // j is an isomorphism (p.15 intuition: products built with different schemes "look the same")
    expect(isIsomorphism(K1, K2, j)).toBeTruthy();
  });
});