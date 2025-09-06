// Minimal exact Rational represented as normalized (n/d) with d>0
export type Rational = { n: bigint; d: bigint };

export function make(n: bigint, d: bigint): Rational {
  if (d === 0n) throw new Error("denominator 0");
  const s = d < 0n ? -1n : 1n;
  const nn = n * s;
  const dd = d * s;
  const g = gcd(abs(nn), dd);
  return { n: nn / g, d: dd / g };
}
export const one = make(1n, 1n);
export const zero = make(0n, 1n);

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

export function fromBigInt(k: bigint): Rational { return make(k, 1n); }

function abs(x: bigint) { return x < 0n ? -x : x; }
function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) { const t = b; b = a % b; a = t; }
  return a < 0n ? -a : a;
}