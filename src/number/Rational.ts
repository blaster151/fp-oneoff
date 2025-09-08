// Minimal exact Rational represented as normalized (n/d) with d>0
export type Rational = { n: number; d: number };

export function make(n: number, d: number): Rational {
  if (d === 0) throw new Error("denominator 0");
  const s = d < 0 ? -1 : 1;
  const nn = n * s;
  const dd = d * s;
  const g = gcd(abs(nn), dd);
  return { n: nn / g, d: dd / g };
}
export const one = make(1, 1);
export const zero = make(0, 1);

export function add(a: Rational, b: Rational): Rational {
  return make(a.n * b.d + b.n * a.d, a.d * b.d);
}
export function neg(a: Rational): Rational { return make(-a.n, a.d); }

export function mul(a: Rational, b: Rational): Rational {
  return make(a.n * b.n, a.d * b.d);
}

export function eq(a: Rational, b: Rational): boolean {
  return a.n === b.n && a.d === b.d;
}

export function fromBigInt(k: number): Rational { return make(k, 1); }

function abs(x: number) { return x < 0 ? -x : x; }
function gcd(a: number, b: number): number {
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a < 0 ? -a : a;
}