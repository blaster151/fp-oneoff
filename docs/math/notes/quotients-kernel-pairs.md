# Quotients from Congruences; Images from Homomorphisms (Smith §2.7, Thm 9)

**Theorem.** For a homomorphism \(f:G→H\), the relation \(x≈y \iff f(x)=f(y)\) is a group **congruence**.
The image of \(f\) is (isomorphic to) the quotient \(G/≈\).
Conversely, every quotient \(G/≈\) arises as the image of some hom \(f\) from \(G\).

**Operationalization.**
- `congruenceFromHom(G,H,f)` builds the kernel-pair congruence.
- `QuotientGroup(cong)` constructs \(G/≈\) with coset reps.
- `firstIsomorphismData(F)` returns the canonical \(\Phi: G/≈_f → im(f)\) and law checks.

**Next unlock:** First Isomorphism Theorem as an explicit `GroupIso`.

## Mathematical Background

### Congruence Relations

A **congruence** on a group G is an equivalence relation ≈ that is compatible with the group operation:
- If x ≈ x' and y ≈ y', then x∘y ≈ x'∘y'

Given any homomorphism f: G → H, we can define a congruence by:
- x ≈ y ⟺ f(x) = f(y)

This is called the **kernel-pair** congruence of f.

### Quotient Groups

Given a congruence ≈ on G, we can form the quotient group G/≈ where:
- Elements are equivalence classes [g] = {h ∈ G : h ≈ g}
- Operation: [g₁] ∘ [g₂] = [g₁ ∘ g₂]
- Identity: [e]
- Inverse: [g]⁻¹ = [g⁻¹]

The compatibility property ensures this is well-defined.

### First Isomorphism Theorem

For any homomorphism f: G → H:
1. The kernel-pair congruence x ≈ y ⟺ f(x) = f(y) is a group congruence
2. There is a canonical isomorphism Φ: G/≈ → im(f) given by Φ([g]) = f(g)
3. This isomorphism makes the following diagram commute:
   ```
   G ---f---> H
   |          ^
   |π         |inclusion
   v          |
   G/≈ --Φ--> im(f)
   ```

## Implementation Details

### Files Created
- `src/algebra/group/Congruence.ts` - Congruence relations and kernel-pair construction
- `src/algebra/group/QuotientGroup.ts` - Quotient group construction G/≈
- `src/algebra/group/FirstIso.ts` - First isomorphism theorem machinery
- `src/algebra/group/__tests__/first-iso.test.ts` - Tests for Z → Z_n examples

### Key Functions
- `congruenceFromHom(G, H, f)` - Creates kernel-pair congruence
- `QuotientGroup(cong)` - Constructs quotient group
- `firstIsomorphismData(F)` - Complete first isomorphism theorem data

### Example Usage
```typescript
import { firstIsomorphismData } from "./FirstIso";
import { modHom } from "./examples/cyclic";

const { Z, Zn, qn } = modHom(6);
const f = { source: Z, target: Zn, map: qn };
const { quotient: Q, phi, checkIsomorphism } = firstIsomorphismData(f);

// Q.Group is isomorphic to Z_6
// phi: Q.Group → Z_6 is the canonical isomorphism
```