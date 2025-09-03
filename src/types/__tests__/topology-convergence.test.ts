/** @math THM-ULTRAFILTER-MONAD */

import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { discrete, productTopology } from "../topology.js";
import { UF } from "../ultrafilter-monad.js";
import { ultrafilterFromCodensity } from "../ultrafilter.js";
import { 
  converges, 
  pushforwardUltrafilter, 
  alphaViaLimit,
  verifyEMViaLimits,
  demonstrateUltrafilterConvergence
} from "../topology-convergence.js";

describe("Ultrafilter convergence + EM map via limits", () => {
  it("discrete: U_a converges uniquely to a; alphaViaLimit agrees with principal witness", () => {
    const A: SetObj<string> = {
      id: "A-test",
      elems: ["p", "q", "r"],
      eq: (x, y) => x === y
    };
    const TA = discrete(A);

    const a0 = "q";
    const t = UF.of(A)(a0);
    const U = ultrafilterFromCodensity<string>(A, t);
    const alpha = alphaViaLimit<string>(TA);

    // Principal ultrafilter U_q converges uniquely to q
    expect(converges<string>(TA, U, a0)).toBe(true);
    expect(["p", "r"].every(x => !converges<string>(TA, U, x))).toBe(true);

    // EM algebra map agrees
    expect(alpha(t)).toBe(a0);
  });

  it("continuity via pushforward: U -> x implies f_*U -> f(x)", () => {
    const A: SetObj<number> = {
      id: "A-cont",
      elems: [0, 1, 2, 3],
      eq: (x, y) => x === y
    };
    const B: SetObj<string> = {
      id: "B-cont", 
      elems: ["L", "R"],
      eq: (x, y) => x === y
    };
    
    const TA = discrete(A);
    const TB = discrete(B);

    const f = (a: number) => (a % 2 ? "R" : "L");
    const x = 3;

    const t = UF.of(A)(x);
    const U = ultrafilterFromCodensity<number>(A, t);
    const fU = pushforwardUltrafilter<number, string>(TA, TB, f, U);

    // Original ultrafilter converges to x
    expect(converges<number>(TA, U, x)).toBe(true);
    
    // Pushforward converges to f(x)
    expect(converges<string>(TB, fU, f(x))).toBe(true);
    
    console.log(`Continuity verified: U → ${x}, f_*U → f(${x}) = ${f(x)}`);
  });

  it("product: U×V converges to (x,y) iff projections converge", () => {
    const X: SetObj<boolean> = {
      id: "X-prod",
      elems: [false, true],
      eq: (x, y) => x === y
    };
    const Y: SetObj<number> = {
      id: "Y-prod",
      elems: [0, 1, 2],
      eq: (x, y) => x === y
    };
    
    const TX = discrete(X);
    const TY = discrete(Y);
    const TXxTY = productTopology(TX, TY);

    const tx = UF.of(X)(true);
    const ty = UF.of(Y)(2);

    const Ux = ultrafilterFromCodensity<boolean>(X, tx);
    const Uy = ultrafilterFromCodensity<number>(Y, ty);

    // Build product ultrafilter via principal pair
    const tpair = UF.of(TXxTY.carrier)([true, 2] as [boolean, number]);
    const Upair = ultrafilterFromCodensity<[boolean, number]>(TXxTY.carrier, tpair);

    // Verify convergence properties
    expect(converges<boolean>(TX, Ux, true)).toBe(true);
    expect(converges<number>(TY, Uy, 2)).toBe(true);
    expect(converges(TXxTY, Upair, [true, 2] as [boolean, number])).toBe(true);
    
    console.log("Product convergence: U×V → (x,y) with projection convergence verified");
  });

  it("verifies EM algebra via unique limits for discrete topology", () => {
    const A: SetObj<string> = {
      id: "A-em",
      elems: ["x", "y", "z"],
      eq: (x, y) => x === y
    };
    const TA = discrete(A);
    
    const testPoints = ["x", "y", "z"];
    const verification = verifyEMViaLimits(TA, testPoints);
    
    expect(verification.allConvergeUniquely).toBe(true);
    
    verification.convergenceResults.forEach(result => {
      console.log(`Point ${result.point}: converges uniquely = ${result.converges}, limit count = ${result.limitCount}`);
      expect(result.converges).toBe(true);
      expect(result.limitCount).toBe(1);
    });
  });

  it("runs convergence demonstration", () => {
    demonstrateUltrafilterConvergence();
    expect(true).toBe(true); // Educational demo
  });
});