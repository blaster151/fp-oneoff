# Canonical Tables and "Same up to Isomorphism" (Smith §2.8)

**Core Insight.**  
The "same group written differently" phrasing is misleading: the *elements* and even the *raw operations* can be totally different (numbers vs. rectangle symmetries), yet the **relational pattern** (the multiplication table up to relabeling) is identical.

So the right object to manipulate is the **isomorphism class**, not any single presentation.

## Operationalization

### 1. Canonical Table Machinery

**`src/algebra/group/iso/CanonicalTable.ts`** - Finite-group canonicalization:
- **`CayleyTable`**: n×n table where `table[a][b] = c` with 0..n-1 indices
- **`isLatinSquare(table)`**: Validates that table represents a valid group operation
- **`relabel(table, p)`**: Applies permutation p to relabel elements
- **`canonicalKey(table)`**: Computes lexicographically smallest serialization over all relabelings
- **WARNING**: Factorial-time; fine for n≤8. For larger groups, use invariants or provided witnesses.

### 2. Isomorphism Class Infrastructure

**`src/algebra/group/iso/IsoClass.ts`** - Core isomorphism class:
- **`IsoClass`**: Wraps CayleyTable with canonical key for equality
- **`orderSpectrum(table)`**: Computes element order distribution as invariant
- **`equals(other)`**: Checks if two isomorphism classes represent the same group

**`src/algebra/group/iso/EnhancedIsoClass.ts`** - Enhanced integration:
- **`EnhancedIsoClass<G>`**: Wraps Group with canonical classification
- **`IsoClassRegistry`**: Registry of known canonical types by key
- **`autoClassifyGroup<G>`**: Automatically classifies groups against known types
- **`createEnhancedIsoClass<G>`**: Creates and optionally registers canonical types

### 3. Group-to-Table Bridge

**`src/algebra/group/iso/GroupToTable.ts`** - Conversion utilities:
- **`groupToTable<G>(G)`**: Converts Group to CayleyTable for canonicalization
- **`tableToGroup(table)`**: Converts CayleyTable back to Group with numeric elements
- **`groupToIsoClass<G>(G)`**: Creates IsoClass directly from Group

## Examples

### Klein Four-Group Recognition

The system recognizes that these different incarnations are all "the Klein four-group":

1. **Standard form**: {e,a,b,c} with a²=b²=c²=e, ab=c, ac=b, bc=a
2. **Alternative representation**: Same structure, different element names  
3. **Rectangle symmetries**: {id, h, v, r180} (identity, horizontal flip, vertical flip, 180° rotation)

All have identical canonical keys, hence are "the same group."

### Cyclic Group Classification

```typescript
const C2 = CyclicCanonical(2);
const C2_alt = ZmodAdd(2);

const enhanced1 = new EnhancedIsoClass(C2, "C2");
const enhanced2 = new EnhancedIsoClass(C2_alt);

// These are recognized as isomorphic
A.ok(enhanced1.isIsomorphicTo(enhanced2));
```

### Automatic Classification

```typescript
// Register a canonical type
const C2 = createEnhancedIsoClass(CyclicCanonical(2), "C2", "Cyclic group of order 2");

// Auto-classify another C2
const C2_alt = autoClassifyGroup(ZmodAdd(2));
// C2_alt.canonicalName is now "C2"
```

## Mathematical Foundation

- **Structure is the object**: The essence of a group isn't what elements "look like," but the functional relations among them
- **Canonical representatives**: Standard forms for common group types (cyclic, dihedral, Klein four)
- **Pattern recognition**: Automatic classification by structural properties
- **Multiplication table as structure**: Normalized canonical key captures group structure up to relabeling

## Implementation Notes

- **Finite groups only**: Current implementation works for finite groups with n≤8 elements
- **Identity assumption**: Assumes element 0 is the identity (limitation for general use)
- **Factorial complexity**: Canonical key computation is O(n!) - use invariants for larger groups
- **Registry system**: Global registry allows automatic classification of known group types

## Integration with Existing Infrastructure

The canonical table machinery integrates seamlessly with:
- **Existing Group interface**: Works with all current group implementations
- **Isomorphism witnesses**: Can be used alongside existing GroupIso machinery
- **Factorization machinery**: Groups can be classified before/after factorization
- **Image/kernel helpers**: Canonical classification works with homomorphism analysis

*Source:* Peter Smith, *Introduction to Category Theory*, §2.8.