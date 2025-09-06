import { Zmod, RProd } from "../Ring";
import { ringHom } from "../Hom";

describe("Finite ring hom witnesses", () => {
  const Z4 = Zmod(4);
  const Z2 = Zmod(2);
  const Z3 = Zmod(3);

  test("mod 2 : Z4 → Z2 (surjective, not injective; not iso)", () => {
    const q = ringHom(Z4, Z2, x => x % 2, "mod2");
    expect(q.witnesses?.isHom).toBe(true);
    expect(q.witnesses?.surjectiveUnderlying).toBe(true);
    expect(q.witnesses?.injectiveUnderlying).toBe(false);
    expect(q.witnesses?.isEpi).toBe(true);  // matches surjective in finite setting
    expect(q.witnesses?.isMono).toBe(false);
    expect(q.witnesses?.isIso).toBe(false);
  });

  test("×2 : Z4 → Z4 (x ↦ 2x) (injective? no; surjective? no)", () => {
    const d = ringHom(Z4, Z4, x => (2*x)%4, "times2");
    expect(d.witnesses?.isHom).toBe(true);
    expect(d.witnesses?.injectiveUnderlying).toBe(false);
    expect(d.witnesses?.surjectiveUnderlying).toBe(false);
    expect(d.witnesses?.isMono).toBe(false);
    expect(d.witnesses?.isEpi).toBe(false);
  });

  test("identity is an isomorphism with explicit inverse", () => {
    const id = ringHom(Z3, Z3, x => x, "id");
    expect(id.witnesses?.isIso).toBe(true);
    expect(id.witnesses?.leftInverse).toBeTruthy();
    expect(id.witnesses?.rightInverse).toBeTruthy();
  });

  test("product ring sanity: projection is surjective (epi in finite case)", () => {
    const Z2xZ3 = RProd(Z2, Z3);
    const proj2 = ringHom(Z2xZ3, Z2, ([a,_b]) => a, "π₁");
    expect(proj2.witnesses?.surjectiveUnderlying).toBe(true);
    expect(proj2.witnesses?.isEpi).toBe(true);
  });
});