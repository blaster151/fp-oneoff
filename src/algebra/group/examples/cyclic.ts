import { Group } from "../structures";

export function Zmod(n: number): Group<number> {
  const norm = (k: number) => ((k % n) + n) % n;
  return {
    e: 0,
    op: (a, b) => norm(a + b),
    inv: (a) => norm(-a),
    eq: (a, b) => norm(a) === norm(b),
    show: (a) => `${norm(a)} (mod ${n})`,
  };
}

/** The quotient map q_n : Z → Z_n */
export function modHom(n: number) {
  const Z: Group<number> = {
    e: 0,
    op: (a, b) => a + b,
    inv: (a) => -a,
    eq: (a, b) => a === b,
    show: (a) => `${a}`,
  };
  const Zn = Zmod(n);
  return { Z, Zn, qn: (x: number) => ((x % n) + n) % n };
}