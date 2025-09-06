/** Finite topology: a set X with a collection of open sets. */
export type Top<X> = {
  carrier: X[];
  opens: X[][];
};

/** Discrete topology: all subsets are open. */
export function discrete<X>(carrier: X[]): Top<X> {
  const opens: X[][] = [];
  const n = carrier.length;
  
  // Generate all subsets (powerset)
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: X[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(carrier[i]);
      }
    }
    opens.push(subset);
  }
  
  return { carrier, opens };
}

/** Indiscrete topology: only ∅ and X are open. */
export function indiscrete<X>(carrier: X[]): Top<X> {
  return {
    carrier,
    opens: [[], carrier]
  };
}

/** Product topology: U×V is open iff U is open in X and V is open in Y. */
export function product<X, Y>(
  eqX: (a: X, b: X) => boolean,
  eqY: (a: Y, b: Y) => boolean,
  TX: Top<X>,
  TY: Top<Y>
): Top<{x: X, y: Y}> {
  const carrier: {x: X, y: Y}[] = [];
  for (const x of TX.carrier) {
    for (const y of TY.carrier) {
      carrier.push({x, y});
    }
  }
  
  const opens: {x: X, y: Y}[][] = [];
  for (const U of TX.opens) {
    for (const V of TY.opens) {
      const UV: {x: X, y: Y}[] = [];
      for (const x of U) {
        for (const y of V) {
          UV.push({x: x as X, y: y as Y});
        }
      }
      opens.push(UV);
    }
  }
  
  return { carrier, opens };
}

/** Check if a function is continuous: f⁻¹(V) is open for every open V. */
export function continuous<X, Y>(
  eqX: (a: X, b: X) => boolean,
  eqY: (a: Y, b: Y) => boolean,
  TX: Top<X>,
  TY: Top<Y>,
  f: (x: X) => Y
): boolean {
  for (const V of TY.opens) {
    const preimage: X[] = [];
    for (const x of TX.carrier) {
      if (V.some(v => eqY(f(x), v))) {
        preimage.push(x);
      }
    }
    
    // Check if preimage is open in TX
    const isOpen = TX.opens.some(U => 
      U.length === preimage.length && 
      preimage.every(x => U.some(u => eqX(x, u)))
    );
    
    if (!isOpen) {
      return false;
    }
  }
  
  return true;
}