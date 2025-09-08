import { strict as A } from "assert";
import { EnhancedGroup } from "../EnhancedGroup";
import { EnhancedGroupHom } from "../EnhancedGroupHom";

// Z8 under +
const addMod = (n:number) => (a:number,b:number)=> (a+b)%n;
const negMod = (n:number) => (a:number)=> (n - (a%n))%n;
const Z8: EnhancedGroup<number> = {
  elems: Array.from({length:8}, (_,i)=>i),
  op: addMod(8),
  e: 0,
  inv: negMod(8),
  show: (x: any) => `${x} (mod 8)`
};

// f: Z8 → Z4 by reduction mod 4
const Z4: EnhancedFiniteGroup<number> = {
  elems: [0,1,2,3],
  op: addMod(4),
  e: 0,
  inv: negMod(4),
  show: (x: any) => `${x} (mod 4)`
};
const mod4 = (x:number)=> x % 4;

describe("GroupHom factorization through quotient (Smith §2.7 Thm 9)", () => {
  it("iota ∘ pi = f and quotient ≅ im(f)", () => {
    const f = enhancedGroupHom(Z8, Z4, mod4);
    const { quotient: Q, pi, iota, law_compose_equals_f } = f.factorization();

    // Witness: iota∘pi = f
    if (Z8.elems === undefined) throw new Error("Z8.elems is undefined");
    for (const g of Z8.elems) A.ok(law_compose_equals_f(g));

    // Size checks: |Q| should equal size of image of f
    const image = new Set(Z8.elems.map(mod4).map(x=>Z4.show!(x)));
    A.equal(Q.elems.length, image.size);

    // Operation respects cosets: [a]+[b] = [a+b]
    for (const a of Z8.elems) for (const b of Z8.elems) {
      const lhs = Q.op(pi(a), pi(b));
      const rhs = pi(Z8.op(a,b));
      A.equal(String(lhs.rep), String(rhs.rep));
    }

    // iota is a homomorphism
    for (const a of Q.elems) for (const b of Q.elems) {
      const lhs = iota(Q.op(a,b));
      const rhs = Z4.op(iota(a), iota(b));
      A.equal(Z4.show!(lhs), Z4.show!(rhs));
    }
  });
});