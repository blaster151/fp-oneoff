/** @math EX-DOUBLE-DUALIZATION */

export type Bit = 0 | 1;
export type Vec = Bit[];          // row vector
export type Mat = Bit[][];        // rows of bits (m × n)

export const F2 = {
  add: (a: Bit, b: Bit): Bit => ((a ^ b) as Bit),
  mul: (a: Bit, b: Bit): Bit => ((a & b) as Bit),
  zero: 0 as Bit,
  one: 1 as Bit,
};

export function zeros(n: number): Vec { 
  return Array(n).fill(0) as Bit[]; 
}

export function matMul(v: Vec, M: Mat): Vec {
  // v (1×n) * M (n×m) => (1×m)
  const n = v.length;
  const m = M[0]?.length ?? 0;
  const out = Array(m).fill(0) as Bit[];
  
  for (let j = 0; j < m; j++) {
    let s: Bit = 0;
    for (let i = 0; i < n; i++) {
      s = F2.add(s, F2.mul(v[i] as Bit, M[i]![j] as Bit));
    }
    out[j] = s;
  }
  return out;
}

export function dimOf(V: { dim: number }): number { 
  return V.dim; 
}

export function basis(n: number): Mat {
  // identity matrix (standard basis)
  const I: Mat = [];
  for (let i = 0; i < n; i++) {
    const row = Array(n).fill(0) as Bit[];
    row[i] = 1; 
    I.push(row);
  }
  return I;
}

export type FinVect = { 
  dim: number;
  name?: string;
};

export function dual(V: FinVect): FinVect { 
  return { 
    dim: V.dim, 
    name: V.name ? `(${V.name})*` : `V*`
  }; 
}

export function doubleDual(V: FinVect): FinVect { 
  return { 
    dim: V.dim, 
    name: V.name ? `(${V.name})**` : `V**`
  }; 
}

/**
 * Evaluation map ev_V : V → V** is an isomorphism in finite dimension
 * In the standard basis, this is just the identity map
 * 
 * @math EX-DOUBLE-DUALIZATION
 */
export function evalIso(V: FinVect): { 
  forward: (v: Vec) => Vec; 
  backward: (vdd: Vec) => Vec;
  isIso: boolean;
} {
  const n = V.dim;
  
  // With the standard basis, identify V ≅ V** componentwise (identity)
  return {
    forward: (v: Vec) => v.slice(0, n),
    backward: (vdd: Vec) => vdd.slice(0, n),
    isIso: true // Always true for finite dimensional vector spaces
  };
}

/**
 * Create standard finite vector space over F₂
 */
export function createFinVect(dim: number, name?: string): FinVect {
  return name ? { dim, name } : { dim };
}

/**
 * Linear map as bit matrix
 */
export function linearMap(from: FinVect, to: FinVect, matrix: Mat): {
  apply: (v: Vec) => Vec;
  matrix: Mat;
  domain: FinVect;
  codomain: FinVect;
} {
  if (matrix.length !== from.dim) {
    throw new Error(`Matrix rows (${matrix.length}) must match domain dimension (${from.dim})`);
  }
  
  if (matrix[0] && matrix[0].length !== to.dim) {
    throw new Error(`Matrix columns (${matrix[0].length}) must match codomain dimension (${to.dim})`);
  }
  
  return {
    apply: (v: Vec) => matMul(v, matrix),
    matrix,
    domain: from,
    codomain: to
  };
}

/**
 * Demonstrate double dualization isomorphism V ≅ V**
 */
export function demonstrateDoubleDual() {
  console.log("🔧 FINITE VECTOR SPACE DOUBLE DUALIZATION");
  console.log("=" .repeat(50));
  
  const V = createFinVect(3, "V");
  const Vstar = dual(V);
  const VstarStar = doubleDual(V);
  
  console.log(`\\nVector space: ${V.name || 'V'} with dim = ${V.dim}`);
  console.log(`Dual space: ${Vstar.name} with dim = ${Vstar.dim}`);
  console.log(`Double dual: ${VstarStar.name} with dim = ${VstarStar.dim}`);
  
  const { forward, backward, isIso } = evalIso(V);
  
  console.log(`\\nEvaluation map ev: V → V** is isomorphism: ${isIso}`);
  
  // Test on standard basis
  const e = basis(V.dim);
  console.log("\\nTesting on standard basis:");
  e.forEach((vec, i) => {
    const toDD = forward(vec);
    const back = backward(toDD);
    const roundTrip = vec.every((bit, j) => bit === back[j]);
    console.log(`  e${i+1}: ${vec.join('')} → ${toDD.join('')} → ${back.join('')} (${roundTrip ? '✅' : '❌'})`);
  });
  
  console.log("\\n🎯 Double dualization V ≅ V** verified for finite dimension!");
}