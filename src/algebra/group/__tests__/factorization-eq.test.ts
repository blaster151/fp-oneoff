import { strict as A } from "assert";
import { GroupHom } from "../GroupHom";
import { Eq } from "../../core/Eq";
import { modHom, Zmod } from "../examples/cyclic";

const eqZ4: Eq<number> = { eq: (a,b)=> (a%4)===(b%4) };

describe("Factorization with Eq", () => {
  it("respects iota∘pi = f", () => {
    const { Z, Zn, qn } = modHom(4);
    const f = new GroupHom(Z, Zn, qn);
    const { quotient, pi, iota, law_compose_equals_f } = f.factorization(eqZ4);
    
    // Test on a finite window of Z
    const testWindow = Array.from({ length: 9 }, (_, i) => i - 4);
    for (const g of testWindow) {
      A.ok(law_compose_equals_f(g));
    }
  });

  it("quotient size matches image size", () => {
    const { Z, Zn, qn } = modHom(6);
    const f = new GroupHom(Z, Zn, qn);
    const { quotient } = f.factorization(eqZ4);
    
    // The quotient should have 6 elements (one for each element of Z6)
    A.equal(quotient.elems.length, 6);
  });
});