# Subgroups as Images of Homomorphisms

## Theorems

- **Theorem 6.** For any homomorphism f: G → H, the image f[G] is a subgroup of H.
- **Theorem 7.** For any subgroup S ≤ H, there exists a homomorphism f: G → H with f[G] = S (take G = S, inclusion).

## Why This Matters

- **Subgroups ↔ homomorphism images.** Together, Thm 6+7 give a bidirectional bridge:
  - Every homomorphism yields a subgroup (its image).
  - Every subgroup can be obtained as an image of some homomorphism.
- This lets us **trade subgroup statements for homomorphism statements.** Instead of reasoning internally about subgroup closure, we can externalize it as a property of maps.
- Category-theory significance: this foreshadows **image factorizations** and the general "epi–mono factorization" theorem: any map factors as a surjection followed by an injection. Subgroups as images are the group-specific case.

## Operationalization

### Implementation

The `inclusionHom` function provides the canonical inclusion homomorphism:

```typescript
export function inclusionHom<A>(
  H: FiniteGroup<A>, 
  S: FiniteGroup<A>, 
  name?: string
): GroupHom<unknown, unknown, A, A> {
  return {
    name: name ?? `incl_${S.name ?? "S"}→${H.name ?? "H"}`,
    source: S,
    target: H,
    map: (s: A) => s, // Inclusion map: s ↦ s
  };
}
```

### Usage

```typescript
// Given a group H and subgroup S ≤ H
const Z6 = Cyclic(6);
const S = { elems: [0, 3], op: Z6.op, id: Z6.id, inv: Z6.inv, eq: Z6.eq, name: "⟨3⟩" };

// Create inclusion homomorphism S ↪ H
const incl = inclusionHom(Z6, S, "⟨3⟩ ↪ Z6");

// Analyze to verify image = S
const analyzed = analyzeHom(incl);
expect(analyzed.witnesses?.imageSubgroup?.elems.sort()).toEqual([0, 3]);
```

### Validation Needed

**Critical TODO items:**

1. **Subgroup validation**: `inclusionHom` should verify that S is actually a subgroup of H:
   - Check that S.elems ⊆ H.elems
   - Verify closure: s₁ ∘ s₂ ∈ S for all s₁, s₂ ∈ S
   - Verify identity: e_S = e_H
   - Verify inverses: s⁻¹ ∈ S for all s ∈ S

2. **Homomorphism verification**: `analyzeHom` should verify that inclusion is actually a homomorphism:
   - Check f(s₁ ∘ s₂) = f(s₁) ∘ f(s₂) for all s₁, s₂ ∈ S
   - Check f(e_S) = e_H
   - Check f(s⁻¹) = f(s)⁻¹ for all s ∈ S

3. **Error handling**: Non-subgroups should be caught and rejected with clear error messages.

## Mathematical Significance

This implementation closes the loop on the fundamental relationship between subgroups and homomorphisms:

- **Forward direction (Thm 6)**: `analyzeHom` shows that every homomorphism image is a subgroup
- **Reverse direction (Thm 7)**: `inclusionHom` shows that every subgroup can be obtained as an image

Together, they provide a complete bidirectional bridge: **subgroups = images of homomorphisms**.

## Future Extensions

- **Image factorizations**: Any homomorphism f: G → H can be factored as G → im(f) → H
- **Epi-mono factorization**: General categorical factorization theorem
- **Subgroup lattice analysis**: Using inclusion homomorphisms to analyze subgroup relationships