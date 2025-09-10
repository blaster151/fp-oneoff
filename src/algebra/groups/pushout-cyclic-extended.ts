import { Cyclic, Z, CycHom } from "./cyclic";
import { CycPairGroup, pushoutCyclic } from "./pushout-cyclic";

// Canonical cocone maps for the pushout
export interface PushoutCocone {
  pushout: CycPairGroup;
  i_A: (a: Z) => [Z, Z];  // i_A: Z_m -> PO, a |-> norm([a, 0])
  i_B: (b: Z) => [Z, Z];  // i_B: Z_n -> PO, b |-> norm([0, b])
}

export function pushoutWithCocone(f: CycHom, g: CycHom): PushoutCocone {
  const pushout = pushoutCyclic(f, g);
  
  const i_A = (a: Z): [Z, Z] => pushout.norm([a, 0]);
  const i_B = (b: Z): [Z, Z] => pushout.norm([0, b]);
  
  return { pushout, i_A, i_B };
}

// Helper to list all normalized representatives
export function listAllRepresentatives(P: CycPairGroup): [Z, Z][] {
  const representatives: [Z, Z][] = [];
  const seen = new Set<string>();
  
  // Generate all possible pairs and normalize them
  for (let a = 0; a < P.M.n; a++) {
    for (let b = 0; b < P.N.n; b++) {
      const normalized = P.norm([a, b]);
      const key = `${normalized[0]},${normalized[1]}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        representatives.push(normalized);
      }
    }
  }
  
  return representatives.sort(([a1, b1], [a2, b2]) => {
    if (a1 !== a2) return a1 - a2;
    return b1 - b2;
  });
}

// Verify that the cocone maps satisfy the universal property
export function verifyCoconeProperty(f: CycHom, g: CycHom): boolean {
  const { pushout, i_A, i_B } = pushoutWithCocone(f, g);
  
  // Check that i_A ∘ f = i_B ∘ g
  // Both should map Z_k to the same element in the pushout
  for (const k_element of f.src.elements) {
    const f_k = f.map(k_element);
    const g_k = g.map(k_element);
    
    const i_A_f_k = i_A(f_k);
    const i_B_g_k = i_B(g_k);
    
    if (!pushout.eq(i_A_f_k, i_B_g_k)) {
      return false;
    }
  }
  
  return true;
}

// Verify that the pushout size matches the number of representatives
export function verifyPushoutSize(P: CycPairGroup): boolean {
  const representatives = listAllRepresentatives(P);
  return representatives.length === P.size;
}
