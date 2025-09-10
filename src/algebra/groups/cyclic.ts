export type Z = number;

export interface Cyclic {
  n: number;                   // modulus > 0
  elements: Z[];               // [0,1,...,n-1]
  add(x: Z, y: Z): Z;
  neg(x: Z): Z;
  eq(x: Z, y: Z): boolean;
  id: Z;
  show?(x: Z): string;
}

export function Zmod(n: number): Cyclic {
  if (n <= 0) throw new Error("n must be positive");
  const norm = (x: number) => ((x % n) + n) % n;
  return {
    n,
    elements: Array.from({ length: n }, (_, i) => i),
    add: (x, y) => norm(x + y),
    neg: (x) => norm(-x),
    eq: (x, y) => norm(x) === norm(y),
    id: 0,
    show: (x) => `${x} (mod ${n})`,
  };
}

// A homomorphism Z_k -> Z_m is determined by the image of 1: send 1 |-> u (mod m)
// Validity condition: k*u ≡ 0 (mod m)
export interface CycHom {
  src: Cyclic;
  dst: Cyclic;
  map(x: Z): Z;    // respects addition
  imgOfOne: Z;     // u
}

export function homZkToZm(k: number, m: number, u: number): CycHom {
  const K = Zmod(k), M = Zmod(m);
  const valid = (k * u) % m === 0;
  if (!valid) {
    throw new Error(`Not a hom: need k * u ≡ 0 (mod ${m}), got ${k}*${u} = ${k*u}.`);
  }
  return {
    src: K,
    dst: M,
    imgOfOne: ((u % m) + m) % m,
    map: (x) => M.add(0, (x * u) % m),
  };
}
