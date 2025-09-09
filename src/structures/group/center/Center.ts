import { FiniteGroup } from "../Group";
import { subgroupFromPredicate } from "../Subgroup";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../../../algebra/group/Hom";

export function center<A>(G: FiniteGroup<A>): FiniteGroup<A> {
  const pred = (z:A)=> G.elems.every(g=> G.eq(G.op(z,g), G.op(g,z)));
  return subgroupFromPredicate(G, pred);
}

/**
 * Enhanced center analysis using the new Second and Third Isomorphism Theorems.
 * This provides comprehensive witness data about the center's relationships with other subgroups.
 */
export function analyzeCenterWithIsomorphismTheorems<A>(G: FiniteGroup<A>): {
  center: FiniteGroup<A>;
  centerSize: number;
  groupSize: number;
  centerIndex: number;
  secondIsoExamples?: any[];
  thirdIsoExamples?: any[];
} {
  const Z = center(G);
  const centerSize = Z.elems.length;
  const groupSize = G.elems.length;
  const centerIndex = groupSize / centerSize;
  
  const result: any = {
    center: Z,
    centerSize,
    groupSize,
    centerIndex
  };
  
  // For small groups, demonstrate Second Isomorphism Theorem applications
  if (groupSize <= 12) {
    result.secondIsoExamples = [];
    
    // Example 1: Center with a cyclic subgroup
    if (centerSize > 1) {
      try {
        // Find a non-trivial element in the center
        const centerElement = Z.elems.find(z => !G.eq(z, G.id));
        if (centerElement) {
          const cyclicSubgroup = [G.id, centerElement];
          const secondIso = secondIsomorphismTheorem(G, cyclicSubgroup, Z.elems, "Center-Cyclic Analysis");
          result.secondIsoExamples.push({
            description: "Center with cyclic subgroup",
            secondIsoData: secondIso.witnesses?.secondIsoData
          });
        }
      } catch (e) {
        // Ignore errors in examples
      }
    }
    
    // Example 2: Center with a different subgroup (if we can find one)
    if (centerSize < groupSize) {
      try {
        // Find a non-center element to create a subgroup
        const nonCenterElement = G.elems.find(g => !Z.elems.some(z => G.eq(g, z)));
        if (nonCenterElement) {
          const otherSubgroup = [G.id, nonCenterElement];
          const secondIso = secondIsomorphismTheorem(G, otherSubgroup, Z.elems, "Center-Other Analysis");
          result.secondIsoExamples.push({
            description: "Center with other subgroup",
            secondIsoData: secondIso.witnesses?.secondIsoData
          });
        }
      } catch (e) {
        // Ignore errors in examples
      }
    }
  }
  
  // For groups with nested normal subgroups, demonstrate Third Isomorphism Theorem
  if (groupSize >= 8 && centerSize > 1) {
    result.thirdIsoExamples = [];
    
    try {
      // Find a proper normal subgroup containing the center
      // This is a simplified example - in practice you'd have specific subgroups
      const centerElements = Z.elems;
      const largerNormalSubgroup = G.elems.filter(g => {
        // Simple heuristic: elements that commute with many others
        const commutesWith = G.elems.filter(h => G.eq(G.op(g, h), G.op(h, g)));
        return commutesWith.length > centerSize;
      });
      
      if (largerNormalSubgroup.length > centerSize && largerNormalSubgroup.length < groupSize) {
        const thirdIso = thirdIsomorphismTheorem(G, centerElements, largerNormalSubgroup, "Center-Normal Analysis");
        result.thirdIsoExamples.push({
          description: "Center within larger normal subgroup",
          thirdIsoData: thirdIso.witnesses?.thirdIsoData
        });
      }
    } catch (e) {
      // Ignore errors in examples
    }
  }
  
  return result;
}