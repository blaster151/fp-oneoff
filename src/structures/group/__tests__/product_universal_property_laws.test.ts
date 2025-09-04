import { describe, it, expect } from "vitest";
import { Z2, Z3, Zn } from "../util/FiniteGroups";
import { tupleScheme } from "../pairing/PairingScheme";
import { productGroup } from "../builders/Product";
import { projections, pairHom } from "../builders/ProductUP";
import { verifyProductUP, comp, homEqByPoints } from "../cat/GroupCat";

describe("Categorical product laws: π, ⟨f,g⟩, uniqueness", () => {
  const G = Z2, H = Z3;
  const S = tupleScheme<number, number>();
  const GH = productGroup(G, H, S);
  const { pi1, pi2 } = projections(G, H, S, GH);

  const K = Zn(6);
  const f = { source: K, target: G, f: (k: number) => k % 2 };
  const g = { source: K, target: H, f: (k: number) => k % 3 };

  it("UP holds and mediating map is unique", () => {
    const pair = (ff: typeof f, gg: typeof g) => ({ source: K, target: GH, f: (k: number) => ({ a: ff.f(k), b: gg.f(k) }) as any });
    const { ok, mediating } = verifyProductUP(K, f, g, pair, pi1, pi2);
    expect(ok).toBe(true);

    // uniqueness: any h with π∘h = (f,g) is pointwise equal to mediating
    const h = pair(f, g);
    expect(homEqByPoints(h, mediating)).toBe(true);

    // sanity: composing with projections recovers f and g
    expect(homEqByPoints(comp(mediating, pi1), f)).toBe(true);
    expect(homEqByPoints(comp(mediating, pi2), g)).toBe(true);
  });
});