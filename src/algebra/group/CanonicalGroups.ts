import { Group } from "./structures";

/**
 * Registry of canonical representative groups
 * These are the "standard forms" for common group types
 */

// Klein four-group (V₄) - the unique non-cyclic group of order 4
export const KleinFour: Group<string> = {
  label: "Klein Four-Group",
  elems: ["e", "a", "b", "c"],
  eq: (x: string, y: string) => x === y,
  op: (x: string, y: string) => {
    if (x === "e") return y;
    if (y === "e") return x;
    if (x === y) return "e"; // a² = b² = c² = e
    // a*b = c, a*c = b, b*c = a
    if ((x === "a" && y === "b") || (x === "b" && y === "a")) return "c";
    if ((x === "a" && y === "c") || (x === "c" && y === "a")) return "b";
    if ((x === "b" && y === "c") || (x === "c" && y === "b")) return "a";
    return "e"; // fallback
  },
  id: "e",
  inv: (x: string) => x // all elements are self-inverse
};

// Cyclic group Cₙ (standard form)
export function CyclicCanonical(n: number): Group<number> {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error(`CyclicCanonical: n must be a positive integer`);
  }
  
  return {
    label: `C${n}`,
    elems: Array.from({ length: n }, (_, i) => i),
    op: (a: number, b: number) => (a + b) % n,
    id: 0,
    inv: (a: number) => (n - (a % n)) % n,
    eq: (a: number, b: number) => a === b
  };
}

// Dihedral group Dₙ (standard form)
export function DihedralCanonical(n: number): Group<string> {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error(`DihedralCanonical: n must be a positive integer`);
  }
  
  const elems: string[] = [];
  // Add rotations: r⁰, r¹, ..., rⁿ⁻¹
  for (let i = 0; i < n; i++) {
    elems.push(`r${i}`);
  }
  // Add reflections: s, sr, sr², ..., srⁿ⁻¹
  for (let i = 0; i < n; i++) {
    elems.push(`sr${i}`);
  }
  
  return {
    label: `D${n}`,
    elems,
    op: (x: string, y: string) => {
      // Parse elements
      const xIsReflection = x.startsWith('s');
      const yIsReflection = y.startsWith('s');
      
      if (!xIsReflection && !yIsReflection) {
        // Both rotations: r^i * r^j = r^(i+j)
        const i = parseInt(x.substring(1));
        const j = parseInt(y.substring(1));
        return `r${(i + j) % n}`;
      } else if (xIsReflection && !yIsReflection) {
        // Reflection * rotation: sr^i * r^j = sr^(i-j)
        const i = parseInt(x.substring(2));
        const j = parseInt(y.substring(1));
        return `sr${(i - j + n) % n}`;
      } else if (!xIsReflection && yIsReflection) {
        // Rotation * reflection: r^i * sr^j = sr^(i+j)
        const i = parseInt(x.substring(1));
        const j = parseInt(y.substring(2));
        return `sr${(i + j) % n}`;
      } else {
        // Both reflections: sr^i * sr^j = r^(i-j)
        const i = parseInt(x.substring(2));
        const j = parseInt(y.substring(2));
        return `r${(i - j + n) % n}`;
      }
    },
    id: "r0",
    inv: (x: string) => {
      if (x.startsWith('s')) {
        return x; // reflections are self-inverse
      } else {
        const i = parseInt(x.substring(1));
        return `r${(n - i) % n}`;
      }
    },
    eq: (a: string, b: string) => a === b
  };
}

/**
 * Registry of all canonical representatives
 */
export const canonicalRepresentatives: Record<string, Group<any>> = {
  "Klein Four": KleinFour,
  "C1": CyclicCanonical(1),
  "C2": CyclicCanonical(2),
  "C3": CyclicCanonical(3),
  "C4": CyclicCanonical(4),
  "C5": CyclicCanonical(5),
  "C6": CyclicCanonical(6),
  "D1": DihedralCanonical(1),
  "D2": DihedralCanonical(2),
  "D3": DihedralCanonical(3),
  "D4": DihedralCanonical(4),
  "D5": DihedralCanonical(5),
  "D6": DihedralCanonical(6),
};

/**
 * Get canonical representative by name
 */
export function getCanonical(name: string): Group<any> | undefined {
  return canonicalRepresentatives[name];
}

/**
 * List all available canonical representatives
 */
export function listCanonical(): string[] {
  return Object.keys(canonicalRepresentatives);
}