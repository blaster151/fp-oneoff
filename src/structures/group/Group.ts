/** Basic finite group structure */
export interface FiniteGroup<T> {
  elems: T[];
  eq: (a: T, b: T) => boolean;
  op: (a: T, b: T) => T;
  id: T;
  inv: (a: T) => T;
  label?: string;
}

/** Trivial group (one element) */
export function trivial<T>(id: T, eq: (a: T, b: T) => boolean): FiniteGroup<T> {
  return {
    elems: [id],
    eq,
    op: (a, b) => id,
    id,
    inv: (a) => id,
    label: "1"
  };
}

/** Check group laws */
export function checkGroup<T>(G: FiniteGroup<T>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const { elems, eq, op, id, inv } = G;

  // Identity law: e * x = x * e = x
  for (const x of elems) {
    if (!eq(op(id, x), x)) errors.push(`Identity left: e * ${x} ≠ ${x}`);
    if (!eq(op(x, id), x)) errors.push(`Identity right: ${x} * e ≠ ${x}`);
  }

  // Inverse law: x * x⁻¹ = x⁻¹ * x = e
  for (const x of elems) {
    if (!eq(op(x, inv(x)), id)) errors.push(`Inverse left: ${x} * ${inv(x)}⁻¹ ≠ e`);
    if (!eq(op(inv(x), x), id)) errors.push(`Inverse right: ${inv(x)}⁻¹ * ${x} ≠ e`);
  }

  // Associativity: (x * y) * z = x * (y * z)
  for (const x of elems) {
    for (const y of elems) {
      for (const z of elems) {
        const left = op(op(x, y), z);
        const right = op(x, op(y, z));
        if (!eq(left, right)) {
          errors.push(`Associativity: (${x} * ${y}) * ${z} ≠ ${x} * (${y} * ${z})`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Cyclic group Z/nZ */
export function Zn(n: number): FiniteGroup<number> {
  const elems = Array.from({ length: n }, (_, i) => i);
  
  return {
    elems,
    eq: (a, b) => a === b,
    op: (a, b) => (a + b) % n,
    id: 0,
    inv: (a) => (n - a) % n,
    label: `Z${n}`
  };
}