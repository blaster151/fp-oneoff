// nerve-quasicat-bridge.ts
// Bridge between existing nerve construction and new quasi-category checking
// Extends the existing category-to-nerve-sset.ts with higher-dimensional horn checking

import { SmallCategory, Quiver, makeFreeCategory, Nerve } from './category-to-nerve-sset.js';
import { SSetUpTo3, isQuasiCategory, QCReport, nerveOfPoset } from './sset-quasicat.js';

// ------------------------------------------------------------
// Convert existing nerve to SSetUpTo3 format
// ------------------------------------------------------------

/**
 * Convert a nerve from the existing category-to-nerve-sset format 
 * to the SSetUpTo3 format for quasi-category checking
 */
export function nerveToSSetUpTo3<O extends string, M>(
  C: SmallCategory<O, M>,
  objects: ReadonlyArray<O>,
  morphisms: ReadonlyArray<M>,
  maxDim: number = 3
): SSetUpTo3 {
  // This is a simplified conversion - full implementation would need
  // to enumerate all n-simplices systematically from the nerve
  
  const V = [...objects];
  
  // Generate edges from non-identity morphisms
  const E = [];
  const edgeKeys = new Set<string>();
  for (const m of morphisms) {
    const src = C.src(m);
    const dst = C.dst(m);
    if (src !== dst) { // skip identities
      const key = `${src}->${dst}`;
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        E.push({ key, src, dst });
      }
    }
  }
  
  // Generate triangles from composable pairs
  const T2 = [];
  const triKeys = new Set<string>();
  for (const f of morphisms) {
    for (const g of morphisms) {
      if (C.dst(f) === C.src(g)) {
        const x = C.src(f);
        const y = C.dst(f);
        const z = C.dst(g);
        if (x !== y && y !== z && x !== z) { // non-degenerate
          const key = `${x}-${y}-${z}`;
          if (!triKeys.has(key)) {
            triKeys.add(key);
            T2.push({
              key,
              e01: `${x}->${y}`,
              e12: `${y}->${z}`,
              e02: `${x}->${z}`
            });
          }
        }
      }
    }
  }
  
  // For now, no 3-simplices (would need 3-fold composition)
  const T3: Array<{key:string; d3:string; d2:string; d1:string; d0:string}> = [];
  
  return { V, E, T2, T3 };
}

/**
 * Check if a category's nerve satisfies quasi-category axioms
 */
export function checkCategoryNerveQuasicat<O extends string, M>(
  C: SmallCategory<O, M>,
  objects: ReadonlyArray<O>,
  morphisms: ReadonlyArray<M>,
  maxDim: number = 3
): QCReport & { 
  sset: SSetUpTo3;
  isNerveOfCategory: boolean;
} {
  const sset = nerveToSSetUpTo3(C, objects, morphisms, maxDim);
  const report = isQuasiCategory(sset, maxDim);
  
  return {
    ...report,
    sset,
    isNerveOfCategory: true // by construction
  };
}

/**
 * Check quasi-category properties of a quiver's free category nerve
 */
export function checkQuiverNerveQuasicat<O extends string>(
  quiver: Quiver<O>,
  maxDim: number = 3
): QCReport & {
  category: ReturnType<typeof makeFreeCategory<O>>;
  sset: SSetUpTo3;
} {
  const category = makeFreeCategory(quiver);
  
  // Convert quiver to string-based format for nerve builder
  const V = quiver.objects.map(String);
  const leq = (x: string, y: string): boolean => {
    // In free category, x ≤ y iff there's a path from x to y
    // For simplicity, use direct edge check (would need path enumeration for full)
    if (x === y) return true;
    return quiver.edges.some(e => e.src === x && e.dst === y);
  };
  
  const sset = nerveOfPoset(V, leq);
  const report = isQuasiCategory(sset, maxDim);
  
  return {
    ...report,
    category,
    sset
  };
}

/**
 * Enhanced nerve analysis that combines homology and quasi-category checking
 */
export function comprehensiveNerveAnalysis<O extends string>(
  quiver: Quiver<O>
): {
  quasiCategoryReport: QCReport;
  // Note: would integrate with homology computation here
  summary: {
    isQuasiCategory: boolean;
    hasInnerHornFillers: boolean;
    dimensions: {
      vertices: number;
      edges: number;
      triangles: number;
      tetrahedra: number;
    };
  };
} {
  const analysis = checkQuiverNerveQuasicat(quiver, 3);
  
  return {
    quasiCategoryReport: analysis,
    summary: {
      isQuasiCategory: analysis.isQuasiCategory,
      hasInnerHornFillers: analysis.horns2.examplesMissing === 0 && 
                          (analysis.horns3?.examplesMissing ?? 0) === 0,
      dimensions: {
        vertices: analysis.sset.V.length,
        edges: analysis.sset.E.length,
        triangles: analysis.sset.T2.length,
        tetrahedra: analysis.sset.T3?.length ?? 0
      }
    }
  };
}