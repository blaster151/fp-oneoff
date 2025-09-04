import { describe, it, expect } from "vitest";
import { lanIdIdImpl, lanIdMaybeImpl, composeViaLan, demonstrateLanGadtBridge } from "../examples/LanGadtBridge.js";
import { Eq } from "../../types/eq.js";

describe("Lan-GADT Bridge", () => {
  it("Lan Id Id can be implemented with equality witnesses", () => {
    const eq: Eq<any> = (x, y) => x === y;
    const result = lanIdIdImpl(eq);
    expect(result).toBe(42);
  });

  it("Lan Id Maybe can be implemented with equality witnesses", () => {
    const eq: Eq<any> = (x, y) => x === y;
    const result = lanIdMaybeImpl(eq);
    expect(result).toBe("some value");
  });

  it("Natural transformation composition via Lan works", () => {
    const eq: Eq<any> = (x, y) => x === y;
    const result = composeViaLan(lanIdIdImpl, eq);
    expect(result).toBe(42);
  });

  it("demonstrates the operational impact", () => {
    // This test just ensures the function runs without error
    expect(() => demonstrateLanGadtBridge()).not.toThrow();
  });
});