import { U } from "../../src/category/instances/ForgetfulGrpToSet";
import { GroupCategory } from "../../src/category/instances/GroupCategory";
import { Zmod, groupHom } from "../helpers/groups";

describe("Forgetful functor U: Grp → Set", () => {
  it("preserves identities", () => {
    const G = Zmod(5);
    const idG = GroupCategory.id(G);
    const uId = U.onMor(idG);
    
    // Check that U(id_G) acts as identity on underlying set
    const carrier = U.onObj(G);
    for (const a of carrier) {
      expect(uId(a)).toBe(a);
    }
  });

  it("preserves composition", () => {
    const G = Zmod(5), H = Zmod(5), J = Zmod(5);
    const f = groupHom(G, H, x => (2*x)%5);
    const g = groupHom(H, J, x => (3*x)%5);

    const comp = GroupCategory.compose(g, f);
    const left = U.onMor(comp);
    const right = (a: number) => U.onMor(g)(U.onMor(f)(a));
    
    const carrier = U.onObj(G);
    for (const a of carrier) {
      expect(left(a)).toBe(right(a));
    }
  });

  it("maps groups to their underlying sets", () => {
    const G = Zmod(3);
    const underlyingSet = U.onObj(G);
    
    expect(underlyingSet.size).toBe(3);
    expect(underlyingSet.has(0)).toBe(true);
    expect(underlyingSet.has(1)).toBe(true);
    expect(underlyingSet.has(2)).toBe(true);
  });
});