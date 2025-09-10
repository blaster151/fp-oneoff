import { describe, it, expect } from "vitest";
import { finiteOpsU0 } from "../../src/size/Universe";
import { finiteSet, total, idU, compU } from "../../src/core/SetU";

describe("Universe-Parametric Sets", () => {
  it("creates finite sets", () => {
    const ops = finiteOpsU0;
    const X = finiteSet(ops, [1, 2, 3]);
    
    expect(X.Uops).toBe(ops);
    expect(ops.fromSmall(X.carrier)).toEqual([1, 2, 3]);
  });

  it("creates total functions", () => {
    const ops = finiteOpsU0;
    const X = finiteSet(ops, [1, 2, 3]);
    const Y = finiteSet(ops, ["a", "b", "c"]);
    
    const f = total(X, Y, (x) => ["a", "b", "c"][x - 1]);
    
    expect(f.dom).toBe(X);
    expect(f.cod).toBe(Y);
    expect(f.map(1)).toBe("a");
    expect(f.map(2)).toBe("b");
    expect(f.map(3)).toBe("c");
  });

  it("creates identity functions", () => {
    const ops = finiteOpsU0;
    const X = finiteSet(ops, [1, 2, 3]);
    
    const id = idU(X);
    
    expect(id.dom).toBe(X);
    expect(id.cod).toBe(X);
    expect(id.map(1)).toBe(1);
    expect(id.map(2)).toBe(2);
    expect(id.map(3)).toBe(3);
  });

  it("composes functions", () => {
    const ops = finiteOpsU0;
    const X = finiteSet(ops, [1, 2, 3]);
    const Y = finiteSet(ops, ["a", "b", "c"]);
    const Z = finiteSet(ops, [true, false]);
    
    const f = total(X, Y, (x) => ["a", "b", "c"][x - 1]);
    const g = total(Y, Z, (y) => y === "a");
    
    const h = compU(g, f);
    
    expect(h.dom).toBe(X);
    expect(h.cod).toBe(Z);
    expect(h.map(1)).toBe(true);  // "a" -> true
    expect(h.map(2)).toBe(false); // "b" -> false
    expect(h.map(3)).toBe(false); // "c" -> false
  });

  it("enforces domain/codomain matching in composition", () => {
    const ops = finiteOpsU0;
    const X = finiteSet(ops, [1, 2, 3]);
    const Y = finiteSet(ops, ["a", "b"]);
    const Z = finiteSet(ops, [true, false]);
    
    const f = total(X, Y, (x) => x === 1 ? "a" : "b");
    const g = total(Z, Z, (z) => z); // Wrong domain!
    
    expect(() => compU(g, f)).toThrow("domain/codomain mismatch");
  });
});
