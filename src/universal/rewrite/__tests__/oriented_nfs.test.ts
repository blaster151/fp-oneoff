import { describe, it, expect } from "vitest";
import { Signature } from "../../Signature";
import { Var, App } from "../../Term";
import { monoidNormalForm, semilatticeNormalForm } from "../Oriented";

/** Signatures */
const MonSig: Signature = { ops: [{ name:"e", arity:0 }, { name:"mul", arity:2 }] };
const JoinSig: Signature = { ops: [{ name:"bot", arity:0 }, { name:"join", arity:2 }] };

describe("Monoid NF (assoc+unit): right-associated canonical shape", () => {
  const { nf } = monoidNormalForm(MonSig, "mul", "e");
  const e = { tag:"App", op: MonSig.ops[0], args: [] } as any;
  const mul = MonSig.ops[1];
  const x = Var(0), y = Var(1), z = Var(2);

  it("drops units and right-associates deterministically", () => {
    const t = App(mul, [x, App(mul, [e, App(mul, [y, z])])]);
    const n = nf(t);
    // expect shape: x*(y*z)
    const target = App(mul, [x, App(mul, [y, z])]);
    expect(JSON.stringify(n)).toBe(JSON.stringify(target));
  });

  it("all units collapse to unit", () => {
    const t = App(mul, [e, App(mul, [e, e])]);
    const n = nf(t);
    expect(JSON.stringify(n)).toBe(JSON.stringify(e));
  });

  it("single non-unit argument remains unchanged", () => {
    const t = App(mul, [e, x]);
    const n = nf(t);
    expect(JSON.stringify(n)).toBe(JSON.stringify(x));
  });

  it("complex nested structure gets right-associated", () => {
    const t = App(mul, [App(mul, [x, y]), App(mul, [z, e])]);
    const n = nf(t);
    // Should become: x*(y*z) (right-associative)
    const target = App(mul, [x, App(mul, [y, z])]);
    expect(JSON.stringify(n)).toBe(JSON.stringify(target));
  });
});

describe("Semilattice NF (ACI+unit): flattened, sorted, deduped", () => {
  const { nf } = semilatticeNormalForm(JoinSig, "join", "bot");
  const bot = { tag:"App", op: JoinSig.ops[0], args: [] } as any;
  const join = JoinSig.ops[1];
  const x = Var(0), y = Var(1), z = Var(2);

  it("x ⋁ (x ⋁ y) ⋁ bot  ↦  x ⋁ y", () => {
    const t = App(join, [x, App(join, [x, y]), bot]);
    const n = nf(t);
    const target = App(join, [x, y]); // sorted, deduped; order irrelevant but we choose lex
    expect(JSON.stringify(n)).toBe(JSON.stringify(target));
  });

  it("commutativity canonicalizes order", () => {
    const t1 = App(join, [z, x, y] as any);
    const t2 = App(join, [y, z, x] as any);
    const n1 = nf(t1), n2 = nf(t2);
    expect(JSON.stringify(n1)).toBe(JSON.stringify(n2));
  });

  it("idempotence removes duplicates", () => {
    const t = App(join, [x, x, y, x]);
    const n = nf(t);
    const target = App(join, [x, y]); // duplicates removed, sorted
    expect(JSON.stringify(n)).toBe(JSON.stringify(target));
  });

  it("associativity flattens nested joins", () => {
    const t = App(join, [x, App(join, [y, z])]);
    const n = nf(t);
    const target = App(join, [x, y, z]); // flattened
    expect(JSON.stringify(n)).toBe(JSON.stringify(target));
  });

  it("all bot elements collapse to bot", () => {
    const t = App(join, [bot, App(join, [bot, bot])]);
    const n = nf(t);
    expect(JSON.stringify(n)).toBe(JSON.stringify(bot));
  });

  it("single non-bot element remains unchanged", () => {
    const t = App(join, [bot, x]);
    const n = nf(t);
    expect(JSON.stringify(n)).toBe(JSON.stringify(x));
  });

  it("complex ACI normalization", () => {
    const t = App(join, [App(join, [y, x]), App(join, [x, z, y])]);
    const n = nf(t);
    // Should become: x ⋁ y ⋁ z (sorted, deduped, flattened)
    const target = App(join, [x, y, z]);
    expect(JSON.stringify(n)).toBe(JSON.stringify(target));
  });
});

describe("Edge cases and robustness", () => {
  const { nf: monoidNf } = monoidNormalForm(MonSig, "mul", "e");
  const { nf: semilatticeNf } = semilatticeNormalForm(JoinSig, "join", "bot");
  const e = { tag:"App", op: MonSig.ops[0], args: [] } as any;
  const bot = { tag:"App", op: JoinSig.ops[0], args: [] } as any;
  const x = Var(0);

  it("variables remain unchanged", () => {
    expect(JSON.stringify(monoidNf(x))).toBe(JSON.stringify(x));
    expect(JSON.stringify(semilatticeNf(x))).toBe(JSON.stringify(x));
  });

  it("units remain unchanged", () => {
    expect(JSON.stringify(monoidNf(e))).toBe(JSON.stringify(e));
    expect(JSON.stringify(semilatticeNf(bot))).toBe(JSON.stringify(bot));
  });

  it("idempotence: applying NF twice gives same result", () => {
    const t1 = App(MonSig.ops[1], [Var(0), App(MonSig.ops[1], [e, Var(1)])]);
    const n1 = monoidNf(t1);
    const n2 = monoidNf(n1);
    expect(JSON.stringify(n1)).toBe(JSON.stringify(n2));

    const t2 = App(JoinSig.ops[1], [Var(0), App(JoinSig.ops[1], [Var(0), Var(1)])]);
    const n3 = semilatticeNf(t2);
    const n4 = semilatticeNf(n3);
    expect(JSON.stringify(n3)).toBe(JSON.stringify(n4));
  });
});