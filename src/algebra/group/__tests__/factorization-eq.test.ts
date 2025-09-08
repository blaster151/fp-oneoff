import { strict as A } from "assert";
import { GroupHom } from "../Hom";
import { factorThroughQuotient } from "../FirstIso";
import { Eq } from "../../../types/eq.js";
import { modHom, Zmod } from "../examples/cyclic";
import { hom } from "../Hom";

const eqZ4: Eq<number> = (a: number, b: number) => (a%4)===(b%4);

describe("Factorization with Eq", () => {
  it("respects iota∘pi = f", () => {
    const { Z, Zn, qn } = modHom(4);
    const f = hom(Z, Zn, qn);
    const { quotient, pi, iota } = factorThroughQuotient(f);
    const law_compose_equals_f = (g: number) => eqZ4(iota.map(pi.map(g)), f.map(g));
    
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
    
    // The quotient should have 4 elements (one for each equivalence class mod 4)
    A.equal(quotient.elems.length, 4);
  });
});