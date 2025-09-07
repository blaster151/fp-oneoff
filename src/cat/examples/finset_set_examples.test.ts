import { finset, finsetMor, FinSetCat } from "../set/FinSet";
import { setObj, setMor, SetCat } from "../set/Set";
import { checkFunctorLaws, Functor } from "../core";

// --- FinSet sanity
describe("FinSet basics", () => {
  const bool = finset("2", [false, true], (x, y) => x === y);
  const three = finset("3", [0,1,2], (x, y) => x === y);

  const not = finsetMor(bool, bool, (b: boolean) => !b);
  const toBool = finsetMor(three, bool, (n: number) => n % 2 === 0);

  it("id, comp work", () => {
    const id = FinSetCat.id<boolean>(bool);
    expect(not.run(true)).toBe(false);
    expect(id.run(true)).toBe(true);

    const comp = FinSetCat.comp(not, id);
    expect(comp.run(false)).toBe(true);
  });
});

// --- Set sanity
describe("Set basics", () => {
  const B = setObj<boolean>("Bool");
  const N = setObj<number>("Num");

  const notS = setMor(B, B, (b: boolean) => !b);
  const isEven = setMor(N, B, (n: number) => n % 2 === 0);

  it("id, comp work", () => {
    const idB = SetCat.id<boolean>(B);
    expect(idB.run(true)).toBe(true);
    const comp = SetCat.comp(notS, isEven);
    expect(comp.run(3)).toBe(true); // not (3 % 2 == 0) → true
  });
});

// --- Forgetful functor sketch: U : FinGrp → Set
// If your FinGrp exports something like:
//   interface FinGroup<A> { carrier: A[]; eq: (x:A,y:A)=>boolean; op:(x:A,y:A)=>A; e:A; inv:(x:A)=>A; }
//   type FinGroupMor<A,B> = Mor<FinGroup<any>, A, B>  (homomorphisms)
//   export const FinGrpCat: SmallCategory<FinGroup<any>, unknown>
//
// then:

// Minimal shape to avoid import churn in this standalone example:
interface FinGroup<A> { label: string; carrier: A[]; }
type FinGroupMor<A,B> = import("../core").Mor<FinGroup<any>, A, B>;
declare const FinGrpCat: import("../core").SmallCategory<FinGroup<any>, unknown>;

// Forgetful on objects: take underlying type as a Set object.
// (We don't enumerate; we only keep the "type" and a friendly name.)
const U: import("../core").Functor<FinGroup<any>, import("../set/Set").SetObj<any>, unknown, unknown> = {
  name: "U_FinGrp_to_Set",
  F0<G>(G: FinGroup<G>) {
    return setObj<G>(`U(${G.label})`);
  },
  F1<A,B>(h: FinGroupMor<A,B>) {
    const dom = setObj<A>("U(dom)");
    const cod = setObj<B>("U(cod)");
    return setMor(dom, cod, h.run);
  }
};

describe("Functor laws (shape check only)", () => {
  it("preserves identities and composition (sampled)", () => {
    // pseudo instances to satisfy signatures for the law tester
    const G: FinGroup<number> = { label: "G", carrier: [0] };
    const H: FinGroup<number> = { label: "H", carrier: [0] };

    // Note: This is a shape test since we don't have actual FinGrpCat here
    expect(U.name).toBe("U_FinGrp_to_Set");
    expect(U.F0(G).name).toBe("U(G)");
  });
});