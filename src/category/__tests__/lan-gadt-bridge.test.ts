import { describe, it, expect } from "vitest";
import { lanIdIdImpl, lanIdMaybeImpl, composeViaLan, demonstrateLanGadtBridge } from "../examples/LanGadtBridge.js";
import type { Eq } from "../Eq.js";

describe("Lan-GADT Bridge", () => {
  it("Lan Id Id can be implemented with equality witnesses", () => {
    const eq: Eq<any, any> = {
      cast: (x: any) => x,
      sym: () => eq,
      andThen: () => eq
    };
    const result = lanIdIdImpl(eq);
    expect(result).toBe(42);
  });

  it("Lan Id Maybe can be implemented with equality witnesses", () => {
    const eq: Eq<any, any> = {
      cast: (x: any) => x,
      sym: () => eq,
      andThen: () => eq
    };
    const result = lanIdMaybeImpl(eq);
    expect(result).toBe("some value");
  });

  it("Natural transformation composition via Lan works", () => {
    const eq: Eq<any, any> = {
      cast: (x: any) => x,
      sym: () => eq,
      andThen: () => eq
    };
    const result = composeViaLan(lanIdIdImpl, eq);
    expect(result).toBe(42);
  });

  it("demonstrates the operational impact", () => {
    // This test just ensures the function runs without error
    expect(() => demonstrateLanGadtBridge()).not.toThrow();
  });
});