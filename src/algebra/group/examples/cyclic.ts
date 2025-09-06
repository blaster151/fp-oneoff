import { Group } from "../Group";

export function Zmod(n: number): Group<number> {
  const norm = (k: number) => ((k % n) + n) % n;
  const elems = Array.from({ length: n }, (_, i) => i);
  return {
    name: `Z${n}`,
    elems,
    id: 0,
    op: (a, b) => norm(a + b),
    inv: (a) => norm(-a),
    eq: (a, b) => norm(a) === norm(b),
    show: (a) => `${norm(a)} (mod ${n})`,
  };
}

/** The quotient map q_n : Z → Z_n */
export function modHom(n: number) {
  const Z: Group<number> = {
    name: "Z",
    elems: Array.from({ length: 2*n+1 }, (_, i) => i - n), // finite window for tests
    id: 0,
    op: (a, b) => a + b,
    inv: (a) => -a,
    eq: (a, b) => a === b,
  };
  const Zn = Zmod(n);
  return { Z, Zn, qn: (x: number) => ((x % n) + n) % n };
}