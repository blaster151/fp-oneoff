import { strict as A } from "assert";
import { FiniteGroup } from "../../src/structures/group/Group";
import { groupHom } from "../../src/algebra/group/GroupHom";

// Z8 under +
const addMod = (n:number) => (a:number,b:number)=> (a+b)%n;
const negMod = (n:number) => (a:number)=> (n - (a%n))%n;
const Z8: FiniteGroup<number> = {
  elems: Array.from({length:8}, (_,i)=>i),
  op: addMod(8),
  id: 0,
  inv: negMod(8),
  eq: (a, b) => a === b,
};

// f: Z8 → Z4 by reduction mod 4
const Z4: FiniteGroup<number> = {
  elems: [0,1,2,3],
  op: addMod(4),
  id: 0,
  inv: negMod(4),
  eq: (a, b) => a === b,
};
const mod4 = (x:number)=> x % 4;

describe("GroupHom factorization through quotient (Smith §2.7 Thm 9)", () => {
  it("iota ∘ pi = f and quotient ≅ im(f)", () => {
    const f = groupHom(Z8, Z4, mod4);
    const { quotient: Q, pi, iota, law_compose_equals_f } = f.factorization();

    // Witness: iota∘pi = f
    for (const g of Z8.elems) A.ok(law_compose_equals_f(g));

    // Size checks: |Q| should equal size of image of f
    const image = new Set(Z8.elems.map(mod4));
    A.equal(Q.elems.length, image.size);

    // Operation respects cosets: [a]+[b] = [a+b]
    for (const a of Z8.elems) for (const b of Z8.elems) {
      const lhs = Q.op(pi(a), pi(b));
      const rhs = pi(Z8.op(a,b));
      A.ok(Q.eq && Q.eq(lhs, rhs), `Coset operation failed for ${a}, ${b}`);
    }

    // iota is a homomorphism
    for (const a of Q.elems) for (const b of Q.elems) {
      const lhs = iota(Q.op(a,b));
      const rhs = Z4.op(iota(a), iota(b));
      A.ok(Z4.eq!(lhs, rhs), `iota homomorphism property failed`);
    }
  });
});
