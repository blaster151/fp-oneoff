// witnesses.ts
// Standard witness types + helpers for finite Set/Rel world.
// Unified witness system with counterexample reporting for all categorical structures.

import { minimizeWitness, shrinkMonadWitness, shrinkLensWitness, applyShrinking, estimateSize } from './property-shrinking.js';

/************ Core witness types ************/

/** Inclusion: right ⊆ left (pairs missing from left). */
export type InclusionWitness<A, B> =
  | { holds: true; missing: [] }
  | { holds: false; missing: Array<[A, B]> };

/** Equality of binary relations via pair sets. */
export type RelEqWitness<A, B> =
  | { equal: true; leftOnly: []; rightOnly: [] }
  | { equal: false; leftOnly: Array<[A, B]>; rightOnly: Array<[A, B]> };

/** Function equality on a finite domain. */
export type FunEqWitness<A, B> =
  | { equal: true; mismatches: [] }
  | { equal: false; mismatches: Array<{ input: A; left: B; right: B }> };

/** Generic law check result with a typed witness payload. */
export type LawCheck<W = unknown> =
  | { ok: true; note?: string }
  | { ok: false; witness?: W; note?: string };

/** Surjection witness with constructive section. */
export type SurjectionWitness<A, Â> = { 
  p: (a: A) => Â; 
  s: (â: Â) => A;
  verified: boolean;
  errors?: string[];
};

/** Equivalence witness for categorical equivalences. */
export type EquivalenceWitness<A, B> =
  | { isEquivalent: true }
  | { isEquivalent: false; reason: string; counterexample?: any };

/** Square commutativity witness. */
export type SquareWitness<A, B, A1, B1> = {
  commutes: boolean;
  leftPath: Array<[A, B1]>;
  rightPath: Array<[A, B1]>;
  witness: InclusionWitness<A, B1>;
};

/** Natural transformation witness. */
export type NaturalityWitness<A, B> = {
  natural: boolean;
  violations?: Array<{ input: A; leftPath: B; rightPath: B }>;
};

/** Adjunction witness with unit/counit verification. */
export type AdjunctionWitness<A, B> = {
  isAdjunction: boolean;
  unitLaw: LawCheck<{ input: A; expected: A; actual: A }>;
  counitLaw: LawCheck<{ input: B; expected: B; actual: B }>;
};

/** Monad law witness with specific violations. */
export type MonadLawWitness<T> = {
  leftUnit: LawCheck<{ input: any; k: any; expected: T; actual: T }>;
  rightUnit: LawCheck<{ input: T; expected: T; actual: T }>;
  associativity: LawCheck<{ m: T; k: any; h: any; expected: T; actual: T }>;
};

/** Strong monad law witness. */
export type StrongMonadWitness<T> = {
  monadLaws: MonadLawWitness<T>;
  strengthUnit: LawCheck<{ a: any; b: any; expected: T; actual: T }>;
  strengthNaturality: LawCheck<{ input: any; expected: T; actual: T }>;
};

/** EM monoid law witness. */
export type EMMonoidWitness<T, A> = {
  monoidLaws: LawCheck<{ a: A; b: A; c: A; operation: string }>;
  algebraUnit: LawCheck<{ input: A; expected: A; actual: A }>;
  multiplicativity: LawCheck<{ ta: T; tb: T; expected: A; actual: A }>;
  unitMorphism: LawCheck<{ input: T; expected: A; actual: A }>;
};

/** Specific witness types for different law violations */
export type MonadLeftUnitWitness<T> = {
  input: any;
  k: (a: any) => T;
  leftSide: T;  // chain(of(input), k)
  rightSide: T; // k(input)
  shrunk?: { input: any }; // minimal failing case if available
};

export type MonadRightUnitWitness<T> = {
  input: T;
  leftSide: T;  // chain(input, of)
  rightSide: T; // input
  shrunk?: { input: T };
};

export type MonadAssociativityWitness<T> = {
  m: T;
  k: (a: any) => T;
  h: (b: any) => T;
  leftSide: T;  // chain(chain(m, k), h)
  rightSide: T; // chain(m, x => chain(k(x), h))
  shrunk?: { m: T; k: any; h: any };
};

export type StrengthUnitWitness<T> = {
  a: any;
  b: any;
  leftSide: T;  // strength(a, of(b))
  rightSide: T; // of([a, b])
  shrunk?: { a: any; b: any };
};

export type EMAlgebraUnitWitness<T, A> = {
  input: A;
  leftSide: A;  // alg(of(input))
  rightSide: A; // input
  shrunk?: { input: A };
};

export type EMMultiplicativityWitness<T, A> = {
  ta: T;
  tb: T;
  leftSide: A;  // alg(map(concat, prod(ta, tb)))
  rightSide: A; // concat(alg(ta), alg(tb))
  shrunk?: { ta: T; tb: T };
};

export type EMUnitMorphismWitness<T, A> = {
  input: T;
  leftSide: A;  // alg(map(_ => empty, input))
  rightSide: A; // empty
  shrunk?: { input: T };
};

/** Relational law witnesses */
export type ResidualAdjunctionWitness<A, B, C> = {
  R: any;  // Relation A -> B
  X: any;  // Relation B -> C  
  S: any;  // Relation A -> C
  leftSide: boolean;   // R;X ≤ S
  rightSide: boolean;  // X ≤ R\S (or R ≤ S/X for right adjunction)
  violatingPair?: readonly [any, any]; // concrete pair that fails the adjunction
  shrunk?: { R: any; X: any; S: any };
};

export type TransformerAdjunctionWitness<State> = {
  P: any;    // Precondition
  R: any;    // Relation  
  Q: any;    // Postcondition
  spPR: any; // sp(P, R)
  wpRQ: any; // wp(R, Q)
  leftHolds: boolean;  // sp(P,R) ⊆ Q
  rightHolds: boolean; // P ⊆ wp(R,Q)
  violatingState?: State;
  shrunk?: { P: any; R: any; Q: any };
};

export type GaloisAdjunctionWitness<A, B> = {
  f: (a: A) => B;
  P: any; // Subset of A
  Q: any; // Subset of B
  R: any; // Subset of A
  adjunctionType: "exists-preimage" | "preimage-forall";
  leftHolds: boolean;
  rightHolds: boolean;
  violatingElement?: A | B;
  shrunk?: { P: any; Q: any; R: any };
};

export type AllegoryLawWitness<A, B, C> = {
  lawType: "dagger-involution" | "modular-left" | "composition-associativity";
  R?: any; // Relations involved
  S?: any;
  T?: any;
  leftSide: any;
  rightSide: any;
  violatingPair?: readonly [any, any];
  shrunk?: { R: any; S: any; T: any };
};

/************ Witness computation helpers ************/

/** Compute inclusion witness using 'has' and carriers A,B with elems. */
export function inclusionWitness<A, B>(
  left: { has: (a: A, b: B) => boolean; A: { elems: A[] }; B: { elems: B[] } },
  right: { has: (a: A, b: B) => boolean; A: { elems: A[] }; B: { elems: B[] } }
): InclusionWitness<A, B> {
  const miss: Array<[A, B]> = [];
  for (const a of right.A.elems) {
    for (const b of right.B.elems) {
      if (right.has(a, b) && !left.has(a, b)) {
        miss.push([a, b]);
      }
    }
  }
  return miss.length === 0 
    ? { holds: true, missing: [] } 
    : { holds: false, missing: miss };
}

/** Equality witness for relations using toPairs (fallback to has+elems if needed). */
export function relEqWitness<A, B>(
  R: { toPairs?: () => Array<[A, B]>; has: (a: A, b: B) => boolean; A: { elems: A[] }; B: { elems: B[] } },
  S: { toPairs?: () => Array<[A, B]>; has: (a: A, b: B) => boolean; A: { elems: A[] }; B: { elems: B[] } }
): RelEqWitness<A, B> {
  const leftPairs = R.toPairs ? R.toPairs() : cartesianPairs(R).filter(([a, b]) => R.has(a, b));
  const rightPairs = S.toPairs ? S.toPairs() : cartesianPairs(S).filter(([a, b]) => S.has(a, b));
  
  const L = new Set(leftPairs.map(p => JSON.stringify(p)));
  const Rset = new Set(rightPairs.map(p => JSON.stringify(p)));
  
  const leftOnly: Array<[A, B]> = [];
  const rightOnly: Array<[A, B]> = [];
  
  for (const s of L) {
    if (!Rset.has(s)) leftOnly.push(JSON.parse(s));
  }
  for (const s of Rset) {
    if (!L.has(s)) rightOnly.push(JSON.parse(s));
  }
  
  return (leftOnly.length === 0 && rightOnly.length === 0)
    ? { equal: true, leftOnly: [], rightOnly: [] }
    : { equal: false, leftOnly, rightOnly };
}

function cartesianPairs<A, B>(R: { A: { elems: A[] }; B: { elems: B[] } }): Array<[A, B]> {
  const out: Array<[A, B]> = [];
  for (const a of R.A.elems) {
    for (const b of R.B.elems) {
      out.push([a, b]);
    }
  }
  return out;
}

/** Function equality on a finite domain A. */
export function funEqWitness<A, B>(
  A: { elems: A[] },
  f: (a: A) => B,
  g: (a: A) => B
): FunEqWitness<A, B> {
  const mismatches: Array<{ input: A; left: B; right: B }> = [];
  for (const a of A.elems) {
    const fa = f(a);
    const ga = g(a);
    if (fa !== ga) {
      mismatches.push({ input: a, left: fa, right: ga });
    }
  }
  return mismatches.length === 0 
    ? { equal: true, mismatches: [] } 
    : { equal: false, mismatches };
}

/** Square commutativity witness. */
export function squareWitness<A, B, A1, B1>(
  square: {
    A: { elems: A[] };
    B: { elems: B[] };
    A1: { elems: A1[] };
    B1: { elems: B1[] };
    f: (a: A) => A1;
    g: (b: B) => B1;
    R: { has: (a: A, b: B) => boolean };
    R1: { has: (a1: A1, b1: B1) => boolean };
  }
): SquareWitness<A, B, A1, B1> {
  // Compute both paths: f;R1 and R;g
  const leftPath: Array<[A, B1]> = [];
  const rightPath: Array<[A, B1]> = [];
  
  for (const a of square.A.elems) {
    const a1 = square.f(a);
    
    // Left path: a --f--> a1, then a1 --R1--> b1
    for (const b1 of square.B1.elems) {
      if (square.R1.has(a1, b1)) {
        leftPath.push([a, b1]);
      }
    }
    
    // Right path: a --R--> b, then b --g--> b1  
    for (const b of square.B.elems) {
      if (square.R.has(a, b)) {
        const b1 = square.g(b);
        rightPath.push([a, b1]);
      }
    }
  }
  
  // Create mock relations for inclusion witness
  const leftRel = {
    has: (a: A, b1: B1) => leftPath.some(([a2, b12]) => a === a2 && b1 === b12),
    A: square.A,
    B: { elems: square.B1.elems }
  };
  
  const rightRel = {
    has: (a: A, b1: B1) => rightPath.some(([a2, b12]) => a === a2 && b1 === b12),
    A: square.A,
    B: { elems: square.B1.elems }
  };
  
  const witness = inclusionWitness(leftRel, rightRel);
  const reverseWitness = inclusionWitness(rightRel, leftRel);
  
  const commutes = witness.holds && reverseWitness.holds;
  
  return {
    commutes,
    leftPath,
    rightPath,
    witness: commutes ? { holds: true, missing: [] } : witness
  };
}

/** Naturality witness for natural transformations. */
export function naturalityWitness<A, B>(
  domain: { elems: A[] },
  codomain: { elems: B[] },
  f: (a: A) => A,
  Tf: (b: B) => B,
  eta_A: (a: A) => B,
  eta_A2: (a: A) => B
): NaturalityWitness<A, B> {
  const violations: Array<{ input: A; leftPath: B; rightPath: B }> = [];
  
  for (const a of domain.elems) {
    // Left path: a --eta_A--> B --Tf--> B
    const leftPath = Tf(eta_A(a));
    
    // Right path: a --f--> A --eta_A2--> B  
    const rightPath = eta_A2(f(a));
    
    if (leftPath !== rightPath) {
      violations.push({ input: a, leftPath, rightPath });
    }
  }
  
  return violations.length === 0
    ? { natural: true }
    : { natural: false, violations };
}

/************ Witness aggregation utilities ************/

/** Combine multiple inclusion witnesses. */
export function combineInclusionWitnesses<A, B>(
  witnesses: Array<InclusionWitness<A, B>>
): InclusionWitness<A, B> {
  const allMissing: Array<[A, B]> = [];
  
  for (const w of witnesses) {
    if (!w.holds) {
      allMissing.push(...w.missing);
    }
  }
  
  return allMissing.length === 0
    ? { holds: true, missing: [] }
    : { holds: false, missing: allMissing };
}

/** Create law check from boolean with optional witness and note. */
export function lawCheck<W>(
  condition: boolean,
  witness?: W,
  note?: string
): LawCheck<W> {
  return condition 
    ? { ok: true, ...(note ? { note } : {}) }
    : { ok: false, ...(witness !== undefined ? { witness } : {}), ...(note ? { note } : {}) };
}

/** Create law check for success cases (no witness needed) */
export function lawCheckSuccess(note?: string): LawCheck<never> {
  return { ok: true, ...(note ? { note } : {}) };
}

/** Create law check with automatic witness shrinking */
export function lawCheckWithShrinking<W>(
  condition: boolean,
  witness: W | undefined,
  validator: (w: W) => boolean,
  note?: string
): LawCheck<W> {
  if (condition) {
    return { ok: true, ...(note ? { note } : {}) };
  }
  
  if (witness === undefined) {
    return { ok: false, ...(note ? { note } : {}) };
  }
  
  // Apply shrinking to minimize the witness
  try {
    const shrunkWitness = applyShrinking(witness, validator);
    const shrinkingNote = note ? 
      `${note} (shrunk from size ${estimateSize(witness)} to ${estimateSize(shrunkWitness)})` : 
      undefined;
    
    return { 
      ok: false, 
      witness: shrunkWitness, 
      ...(shrinkingNote ? { note: shrinkingNote } : {}) 
    };
  } catch {
    // If shrinking fails, return original witness
    return { ok: false, witness, ...(note ? { note } : {}) };
  }
}

/** Extract counterexamples from witness. */
export function extractCounterexamples<A, B>(
  witness: InclusionWitness<A, B>
): Array<[A, B]> {
  return witness.holds ? [] : witness.missing;
}

/** Check if any witness indicates failure. */
export function hasFailures(witnesses: Array<{ holds?: boolean; ok?: boolean; equal?: boolean }>): boolean {
  return witnesses.some(w => 
    (w.holds !== undefined && !w.holds) ||
    (w.ok !== undefined && !w.ok) ||
    (w.equal !== undefined && !w.equal)
  );
}

/************ Pretty printing utilities ************/

/** Format witness for human-readable output. */
export function formatWitness(witness: any): string {
  if (typeof witness === 'boolean') {
    return witness ? "✅" : "❌";
  }
  
  if (witness && typeof witness === 'object') {
    if ('holds' in witness) {
      return witness.holds 
        ? "✅ Inclusion holds" 
        : `❌ Missing ${witness.missing.length} pairs: ${JSON.stringify(witness.missing.slice(0, 3))}${witness.missing.length > 3 ? '...' : ''}`;
    }
    
    if ('equal' in witness) {
      return witness.equal
        ? "✅ Relations equal"
        : `❌ Left-only: ${witness.leftOnly.length}, Right-only: ${witness.rightOnly.length}`;
    }
    
    if ('ok' in witness) {
      if (witness.ok) {
        return "✅ Law satisfied" + (witness.note ? ` (${witness.note})` : "");
      } else {
        let result = "❌ Law violated";
        if (witness.note) result += ` (${witness.note})`;
        if (witness.witness) {
          // Format specific witness types
          const w = witness.witness;
          if ('input' in w && 'leftSide' in w && 'rightSide' in w) {
            result += `: input=${JSON.stringify(w.input)}, got=${JSON.stringify(w.leftSide)}, expected=${JSON.stringify(w.rightSide)}`;
          } else if ('violatingPair' in w) {
            result += `: violating pair=${JSON.stringify(w.violatingPair)}`;
          } else {
            result += `: ${JSON.stringify(w)}`;
          }
        }
        return result;
      }
    }
  }
  
  return String(witness);
}

/** Batch format multiple witnesses. */
export function formatWitnesses(witnesses: Record<string, any>): string {
  const lines: string[] = [];
  for (const [name, witness] of Object.entries(witnesses)) {
    lines.push(`  ${name}: ${formatWitness(witness)}`);
  }
  return lines.join('\n');
}