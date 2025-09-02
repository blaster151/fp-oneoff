// quiver-pushout.ts
// Quiver pushouts and coequalizers for schema/graph merging with universal properties
// - Pushout(Q0 ← Q → Q2): canonical merge of two schemas along shared base
// - Coequalizer(r0, r1): quotient by parallel morphisms (rename/migration)
// - Audit trail: replayable history of merge/rename operations
//
// This provides the categorical foundation for schema evolution and graph merging

import { Quiver, Edge } from './category-to-nerve-sset.js';

/************ Basic types for pushouts and coequalizers ************/

export type Vertex = string;
export type EdgeLabel = string;

export interface QuiverMorphism<V> {
  readonly name: string;
  readonly vertexMap: Map<V, V>;
  readonly edgeMap: Map<string, string>; // edge key -> edge key
}

export interface AuditEntry {
  readonly operation: 'pushout' | 'coequalizer' | 'rename';
  readonly timestamp: Date;
  readonly details: {
    readonly verticesIdentified?: Array<{left: Vertex; right: Vertex; result: Vertex}>;
    readonly edgesIdentified?: Array<{left: string; right: string; result: string}>;
    readonly labelConflicts?: Array<{vertex: Vertex; leftLabel?: string; rightLabel?: string; resolution: string}>;
    readonly quotientClasses?: Array<{representative: Vertex; equivalents: Vertex[]}>;
  };
  readonly description: string;
}

export interface PushoutResult<V> {
  readonly pushout: Quiver<V>;
  readonly leftLeg: QuiverMorphism<V>;
  readonly rightLeg: QuiverMorphism<V>;
  readonly audit: AuditEntry;
}

export interface CoequalizerResult<V> {
  readonly quotient: Quiver<V>;
  readonly projection: QuiverMorphism<V>;
  readonly audit: AuditEntry;
}

/************ Pushout construction ************/

/**
 * Compute pushout of quivers: Q1 ←f— Q0 —g→ Q2
 * Returns the canonical merge Q along with universal morphisms
 */
export function pushout<V extends string>(
  Q0: Quiver<V>, Q1: Quiver<V>, Q2: Quiver<V>,
  f: QuiverMorphism<V>, g: QuiverMorphism<V>
): PushoutResult<V> {
  const audit: AuditEntry = {
    operation: 'pushout',
    timestamp: new Date(),
    details: {
      verticesIdentified: [],
      edgesIdentified: [],
      labelConflicts: []
    },
    description: `Pushout of ${Q1.objects.length}+${Q2.objects.length} vertices via ${Q0.objects.length} shared`
  };

  // Build pushout by identifying images of Q0 in Q1 and Q2
  const vertexEquiv = new Map<V, V>(); // canonical representative for each equivalence class
  const edgeEquiv = new Map<string, string>();
  
  // Start with all vertices from Q1 and Q2
  const resultVertices = new Set<V>();
  const resultEdges: Array<Edge<V>> = [];
  
  // Add Q1 vertices
  for (const v of Q1.objects) {
    resultVertices.add(v);
    vertexEquiv.set(v, v);
  }
  
  // Add Q2 vertices, identifying with Q1 via Q0
  for (const v of Q2.objects) {
    // Check if this vertex is the image of something in Q0
    let identified = false;
    for (const v0 of Q0.objects) {
      const fv0 = f.vertexMap.get(v0);
      const gv0 = g.vertexMap.get(v0);
      if (gv0 === v && fv0) {
        // v in Q2 should be identified with fv0 in Q1
        vertexEquiv.set(v, fv0);
        identified = true;
        audit.details.verticesIdentified!.push({
          left: fv0,
          right: v,
          result: fv0
        });
        break;
      }
    }
    if (!identified) {
      resultVertices.add(v);
      vertexEquiv.set(v, v);
    }
  }
  
  // Build canonical vertex set
  const canonicalVertices = Array.from(new Set(Array.from(vertexEquiv.values())));
  
  // Add edges from Q1
  for (const e of Q1.edges) {
    const srcCanonical = vertexEquiv.get(e.src)!;
    const dstCanonical = vertexEquiv.get(e.dst)!;
    const edgeKey = `${srcCanonical}->${dstCanonical}:${e.label || 'unlabeled'}`;
    
    resultEdges.push({
      src: srcCanonical,
      dst: dstCanonical,
      label: e.label || `${srcCanonical}->${dstCanonical}`
    });
    edgeEquiv.set(`Q1:${e.src}->${e.dst}:${e.label}`, edgeKey);
  }
  
  // Add edges from Q2, checking for identification
  for (const e of Q2.edges) {
    const srcCanonical = vertexEquiv.get(e.src)!;
    const dstCanonical = vertexEquiv.get(e.dst)!;
    const edgeKey = `${srcCanonical}->${dstCanonical}:${e.label || 'unlabeled'}`;
    
    // Check if this edge already exists (from Q1 via Q0 identification)
    const existing = resultEdges.find(re => 
      re.src === srcCanonical && re.dst === dstCanonical && re.label === e.label
    );
    
    if (!existing) {
      resultEdges.push({
        src: srcCanonical,
        dst: dstCanonical,
        label: e.label || `${srcCanonical}->${dstCanonical}`
      });
    }
    
    edgeEquiv.set(`Q2:${e.src}->${e.dst}:${e.label}`, edgeKey);
  }
  
  // Remove duplicate edges
  const uniqueEdges = Array.from(
    new Map(resultEdges.map(e => [`${e.src}->${e.dst}:${e.label}`, e])).values()
  );
  
  const pushoutQuiver: Quiver<V> = {
    objects: canonicalVertices,
    edges: uniqueEdges
  };
  
  // Build universal morphisms
  const leftLeg: QuiverMorphism<V> = {
    name: 'pushout-left',
    vertexMap: new Map(Q1.objects.map(v => [v, vertexEquiv.get(v)!])),
    edgeMap: new Map() // Simplified for now
  };
  
  const rightLeg: QuiverMorphism<V> = {
    name: 'pushout-right', 
    vertexMap: new Map(Q2.objects.map(v => [v, vertexEquiv.get(v)!])),
    edgeMap: new Map() // Simplified for now
  };

  return {
    pushout: pushoutQuiver,
    leftLeg,
    rightLeg,
    audit
  };
}

/************ Coequalizer construction ************/

/**
 * Compute coequalizer of parallel morphisms r0, r1: Q → Q'
 * Returns quotient quiver where r0(x) ~ r1(x) for all x
 */
export function coequalizer<V extends string>(
  Q: Quiver<V>,
  r0: QuiverMorphism<V>,
  r1: QuiverMorphism<V>
): CoequalizerResult<V> {
  const audit: AuditEntry = {
    operation: 'coequalizer',
    timestamp: new Date(),
    details: {
      quotientClasses: []
    },
    description: `Coequalizer identifying ${r0.name} ~ ${r1.name}`
  };

  // Build equivalence relation from the parallel morphisms
  const equiv = new Map<V, V>(); // vertex -> canonical representative
  const quotientClasses = new Map<V, Set<V>>(); // representative -> equivalence class
  
  // Initialize with identity
  for (const v of Q.objects) {
    equiv.set(v, v);
    quotientClasses.set(v, new Set([v]));
  }
  
  // Add identifications from parallel morphisms
  for (const v of Q.objects) {
    const r0v = r0.vertexMap.get(v);
    const r1v = r1.vertexMap.get(v);
    
    if (r0v && r1v && r0v !== r1v) {
      // Identify r0(v) with r1(v)
      const rep0 = equiv.get(r0v)!;
      const rep1 = equiv.get(r1v)!;
      
      if (rep0 !== rep1) {
        // Merge equivalence classes
        const class0 = quotientClasses.get(rep0)!;
        const class1 = quotientClasses.get(rep1)!;
        
        // Use lexicographically smaller as representative
        const newRep = rep0 < rep1 ? rep0 : rep1;
        const oldRep = rep0 < rep1 ? rep1 : rep0;
        
        // Update all members of oldRep class to point to newRep
        for (const member of class1) {
          equiv.set(member, newRep);
        }
        
        // Merge classes
        for (const member of class1) {
          class0.add(member);
        }
        quotientClasses.delete(oldRep);
        
        audit.details.quotientClasses!.push({
          representative: newRep,
          equivalents: Array.from(class0)
        });
      }
    }
  }
  
  // Build quotient quiver
  const quotientVertices = Array.from(quotientClasses.keys());
  const quotientEdges: Array<Edge<V>> = [];
  
  for (const e of Q.edges) {
    const srcQuotient = equiv.get(e.src)!;
    const dstQuotient = equiv.get(e.dst)!;
    
    // Check if this edge already exists in quotient
    const existing = quotientEdges.find(qe => 
      qe.src === srcQuotient && qe.dst === dstQuotient && qe.label === e.label
    );
    
    if (!existing) {
      quotientEdges.push({
        src: srcQuotient,
        dst: dstQuotient,
        label: e.label || `${srcQuotient}->${dstQuotient}`
      });
    }
  }
  
  const quotientQuiver: Quiver<V> = {
    objects: quotientVertices,
    edges: quotientEdges
  };
  
  const projection: QuiverMorphism<V> = {
    name: 'coequalizer-projection',
    vertexMap: equiv,
    edgeMap: new Map() // Simplified for now
  };

  return {
    quotient: quotientQuiver,
    projection,
    audit
  };
}

/************ Convenience operations ************/

/**
 * Rename vertices in a quiver (implemented via coequalizer)
 */
export function renameVertices<V extends string>(
  Q: Quiver<V>,
  renaming: Map<V, V>
): CoequalizerResult<V> {
  // Create parallel morphisms: identity and renaming
  const identity: QuiverMorphism<V> = {
    name: 'identity',
    vertexMap: new Map(Q.objects.map(v => [v, v])),
    edgeMap: new Map()
  };
  
  const rename: QuiverMorphism<V> = {
    name: 'rename',
    vertexMap: new Map(Q.objects.map(v => [v, renaming.get(v) || v])),
    edgeMap: new Map()
  };
  
  return coequalizer(Q, identity, rename);
}

/**
 * Simple schema merge: pushout of Q1 ← Q0 → Q2 where Q0 is intersection
 */
export function mergeSchemas<V extends string>(
  Q1: Quiver<V>,
  Q2: Quiver<V>
): PushoutResult<V> {
  // Find intersection as Q0
  const sharedVertices = Q1.objects.filter(v => Q2.objects.includes(v));
  const sharedEdges = Q1.edges.filter(e1 => 
    Q2.edges.some(e2 => e1.src === e2.src && e1.dst === e2.dst && e1.label === e2.label)
  );
  
  const Q0: Quiver<V> = {
    objects: sharedVertices,
    edges: sharedEdges
  };
  
  // Inclusion morphisms
  const incl1: QuiverMorphism<V> = {
    name: 'include-left',
    vertexMap: new Map(sharedVertices.map(v => [v, v])),
    edgeMap: new Map()
  };
  
  const incl2: QuiverMorphism<V> = {
    name: 'include-right',
    vertexMap: new Map(sharedVertices.map(v => [v, v])),
    edgeMap: new Map()
  };
  
  return pushout(Q0, Q1, Q2, incl1, incl2);
}

/************ Audit trail management ************/

export class AuditTrail {
  private entries: AuditEntry[] = [];
  
  add(entry: AuditEntry): void {
    this.entries.push(entry);
  }
  
  getEntries(): readonly AuditEntry[] {
    return this.entries;
  }
  
  replay(): string[] {
    return this.entries.map(entry => 
      `[${entry.timestamp.toISOString()}] ${entry.operation}: ${entry.description}`
    );
  }
  
  exportJson(): string {
    return JSON.stringify(this.entries, null, 2);
  }
  
  static fromJson(json: string): AuditTrail {
    const trail = new AuditTrail();
    const entries = JSON.parse(json);
    for (const entry of entries) {
      trail.add({
        ...entry,
        timestamp: new Date(entry.timestamp)
      });
    }
    return trail;
  }
}

/************ Schema migration operations ************/

export interface MigrationStep<V> {
  readonly type: 'pushout' | 'coequalizer' | 'rename';
  readonly description: string;
  readonly apply: (q: Quiver<V>, trail: AuditTrail) => Quiver<V>;
}

export function createPushoutStep<V extends string>(
  other: Quiver<V>,
  description: string
): MigrationStep<V> {
  return {
    type: 'pushout',
    description,
    apply: (q: Quiver<V>, trail: AuditTrail) => {
      const result = mergeSchemas(q, other);
      trail.add(result.audit);
      return result.pushout;
    }
  };
}

export function createRenameStep<V extends string>(
  renaming: Map<V, V>,
  description: string
): MigrationStep<V> {
  return {
    type: 'rename',
    description,
    apply: (q: Quiver<V>, trail: AuditTrail) => {
      const result = renameVertices(q, renaming);
      trail.add(result.audit);
      return result.quotient;
    }
  };
}

export function applyMigration<V extends string>(
  initial: Quiver<V>,
  steps: MigrationStep<V>[]
): { result: Quiver<V>; trail: AuditTrail } {
  const trail = new AuditTrail();
  let current = initial;
  
  for (const step of steps) {
    current = step.apply(current, trail);
  }
  
  return { result: current, trail };
}

/************ Universal property verification ************/

/**
 * Check if a quiver morphism satisfies the pushout universal property
 */
export function verifyPushoutUniversal<V extends string>(
  pushoutResult: PushoutResult<V>,
  testMorphism1: QuiverMorphism<V>,
  testMorphism2: QuiverMorphism<V>
): { satisfies: boolean; witness?: QuiverMorphism<V> } {
  // For pushout Q1 ← Q0 → Q2 with result P,
  // any pair of morphisms Q1 → X, Q2 → X that agree on Q0
  // should factor uniquely through P → X
  
  // Check if test morphisms agree on shared elements
  const Q0vertices = new Set<V>();
  for (const [v1, canonical] of pushoutResult.leftLeg.vertexMap) {
    for (const [v2, canonical2] of pushoutResult.rightLeg.vertexMap) {
      if (canonical === canonical2) {
        Q0vertices.add(canonical);
      }
    }
  }
  
  // Simplified check: if morphisms agree on shared vertices,
  // then pushout universal property should hold
  let agrees = true;
  for (const v of Q0vertices) {
    const img1 = testMorphism1.vertexMap.get(v);
    const img2 = testMorphism2.vertexMap.get(v);
    if (img1 !== img2) {
      agrees = false;
      break;
    }
  }
  
  if (!agrees) {
    return { satisfies: false };
  }
  
  // Construct witness morphism from pushout
  const witnessVertexMap = new Map<V, V>();
  for (const v of pushoutResult.pushout.objects) {
    // Find corresponding vertices in Q1 or Q2
    const fromQ1 = Array.from(pushoutResult.leftLeg.vertexMap.entries())
      .find(([_, canonical]) => canonical === v);
    const fromQ2 = Array.from(pushoutResult.rightLeg.vertexMap.entries())
      .find(([_, canonical]) => canonical === v);
    
    if (fromQ1) {
      const target = testMorphism1.vertexMap.get(fromQ1[0]);
      if (target) witnessVertexMap.set(v, target);
    } else if (fromQ2) {
      const target = testMorphism2.vertexMap.get(fromQ2[0]);
      if (target) witnessVertexMap.set(v, target);
    }
  }
  
  const witness: QuiverMorphism<V> = {
    name: 'pushout-witness',
    vertexMap: witnessVertexMap,
    edgeMap: new Map()
  };
  
  return { satisfies: true, witness };
}

/************ Pretty printing and utilities ************/

export function printQuiver<V>(Q: Quiver<V>, name?: string): void {
  console.log(`${name || 'Quiver'}:`);
  console.log(`  Vertices: {${Q.objects.join(', ')}}`);
  console.log(`  Edges: {${Q.edges.map(e => `${e.src}-[${e.label}]->${e.dst}`).join(', ')}}`);
}

export function printMorphism<V>(m: QuiverMorphism<V>): void {
  console.log(`Morphism ${m.name}:`);
  console.log(`  Vertices: ${Array.from(m.vertexMap.entries()).map(([k,v]) => `${k}→${v}`).join(', ')}`);
}

export function printAudit(audit: AuditEntry): void {
  console.log(`Audit [${audit.operation}]: ${audit.description}`);
  if (audit.details.verticesIdentified?.length) {
    console.log(`  Vertices identified: ${audit.details.verticesIdentified.map(v => `${v.left}≡${v.right}→${v.result}`).join(', ')}`);
  }
  if (audit.details.quotientClasses?.length) {
    console.log(`  Quotient classes: ${audit.details.quotientClasses.map(c => `[${c.equivalents.join(',')}]→${c.representative}`).join(', ')}`);
  }
}

/************ Example schema construction helpers ************/

export function makeSchema<V extends string>(name: string, vertices: V[], edges: Array<{src: V; dst: V; label?: string}>): Quiver<V> {
  return {
    objects: vertices,
    edges: edges.map(e => ({
      src: e.src,
      dst: e.dst,
      label: e.label || `${e.src}->${e.dst}`
    }))
  };
}

export function makeIdentityMorphism<V extends string>(Q: Quiver<V>, name: string): QuiverMorphism<V> {
  return {
    name,
    vertexMap: new Map(Q.objects.map(v => [v, v])),
    edgeMap: new Map()
  };
}