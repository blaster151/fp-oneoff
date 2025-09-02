// catkit-homology-bridge.ts
// Bridge between existing category-to-nerve-sset types and catkit-homology types
// This allows seamless integration of homology computation with existing nerve construction

import { SmallCategory, Quiver as ExistingQuiver, Edge as ExistingEdge, PathMor, makeFreeCategory } from './category-to-nerve-sset.js';
import { HomologyQuiver, HomologyEdge, computeHomology01, computeHomology01_Z, HomologyBuildOptions } from './catkit-homology.js';

// ------------------------------------------------------------
// Type conversion functions
// ------------------------------------------------------------

/** Convert existing Quiver<string> to homology HomologyQuiver */
export function toHomologyQuiver(q: ExistingQuiver<string>): HomologyQuiver {
  return {
    objects: [...q.objects],
    edges: q.edges.map(e => ({
      src: e.src,
      dst: e.dst,
      label: e.label || `${e.src}->${e.dst}`
    }))
  };
}

/** Convert homology HomologyQuiver to existing Quiver<string> */
export function fromHomologyQuiver(q: HomologyQuiver): ExistingQuiver<string> {
  return {
    objects: q.objects,
    edges: q.edges.map(e => ({
      src: e.src,
      dst: e.dst,
      label: e.label
    }))
  };
}

// ------------------------------------------------------------
// Integrated homology computation for existing categories
// ------------------------------------------------------------

/** Compute homology directly from an existing SmallCategory via its underlying quiver structure */
export function computeCategoryHomology<O extends string>(
  objects: ReadonlyArray<O>,
  edges: ReadonlyArray<ExistingEdge<O>>,
  opt: HomologyBuildOptions = {}
) {
  const quiver: HomologyQuiver = {
    objects: [...objects],
    edges: edges.map(e => ({
      src: e.src,
      dst: e.dst,
      label: e.label || `${e.src}->${e.dst}`
    }))
  };
  
  return {
    rational: computeHomology01(quiver, opt),
    integer: computeHomology01_Z(quiver, opt)
  };
}

/** Compute homology from a free category on a quiver */
export function computeFreeQuiverHomology(
  q: ExistingQuiver<string>,
  opt: HomologyBuildOptions = {}
) {
  const homologyQuiver = toHomologyQuiver(q);
  return {
    rational: computeHomology01(homologyQuiver, opt),
    integer: computeHomology01_Z(homologyQuiver, opt)
  };
}

// ------------------------------------------------------------
// Integration with nerve construction
// ------------------------------------------------------------

/** 
 * Compute homology of the nerve of a category by first extracting its quiver structure
 * This bridges the gap between abstract categories and concrete homological computation
 */
export function computeNerveHomology<O extends string, M>(
  C: SmallCategory<O, M>,
  objects: ReadonlyArray<O>,
  morphisms: ReadonlyArray<M>,
  opt: HomologyBuildOptions = {}
) {
  // Extract the underlying graph structure by looking at non-identity morphisms
  const edges: HomologyEdge[] = [];
  const seenEdges = new Set<string>();
  
  for (const m of morphisms) {
    const src = C.src(m);
    const dst = C.dst(m);
    
    // Skip identity morphisms for homology computation
    if (src === dst) continue;
    
    const edgeKey = `${src}->${dst}`;
    if (!seenEdges.has(edgeKey)) {
      seenEdges.add(edgeKey);
      edges.push({
        src,
        dst,
        label: edgeKey
      });
    }
  }
  
  const quiver: HomologyQuiver = {
    objects: [...objects],
    edges
  };
  
  return {
    rational: computeHomology01(quiver, opt),
    integer: computeHomology01_Z(quiver, opt),
    quiver // return the extracted quiver for inspection
  };
}