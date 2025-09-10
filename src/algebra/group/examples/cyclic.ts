import { FiniteGroup } from "../../../structures/group/Group";

export function Zmod(n: number): FiniteGroup<number> {
  const norm = (k: number) => ((k % n) + n) % n;
  const elems = Array.from({ length: n }, (_, i) => i);
  return {
    elems,
    id: 0,
    op: (a, b) => norm(a + b),
    inv: (a) => norm(-a),
    eq: (a, b) => norm(a) === norm(b),
    label: `Z${n}`
  };
}

/** The quotient map q_n : Z → Z_n */
export function modHom(n: number) {
  // For testing, we use a finite window of Z around 0
  const windowSize = 5 * n + 1;
  const elems = Array.from({ length: windowSize }, (_, k) => k - Math.floor(windowSize / 2));
  
  const Z: FiniteGroup<number> = {
    elems,
    id: 0,
    op: (a, b) => a + b,
    inv: (a) => -a,
    eq: (a, b) => a === b,
    label: "Z"
  };
  const Zn = Zmod(n);
  return { Z, Zn, qn: (x: number) => ((x % n) + n) % n };
}