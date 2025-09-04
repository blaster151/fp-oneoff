import { describe, it, expect } from "vitest";
import { Eq, refl, compose, coerce } from "../Eq";

describe("Eq (equality witness)", () => {
  it("refl behaves as identity", () => {
    const r = refl<number>();
    expect(r.cast(42)).toBe(42);
    expect(r.sym().cast(7)).toBe(7);
  });

  it("compose chains casts", () => {
    // Toy example: string -> string (identity) twice
    const r = refl<string>();
    const rr = compose(r, r);
    expect(rr.cast("ok")).toBe("ok");
  });

  it("coerce uses Eq", () => {
    const r = refl<{ x: number }>();
    expect(coerce(r, { x: 1 }).x).toBe(1);
  });
});