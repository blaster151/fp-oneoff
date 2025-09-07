# Subcategories of \(\mathbf{Grp}\) (Smith §2.9(c–d))

We can build many structured subcategories of Grp:
- **Trivial:** one group with only its identity morphism.
- **Disjoint identities:** multiple groups, only identities.
- **Finite-isomorphism category:** finite groups up to size \(n\), with morphisms restricted to isomorphisms.
- **Finite-full category:** finite groups up to size \(n\), with all homomorphisms included.

These highlight the spectrum from degenerate to homomorphism-rich categories,
and mirror the examples in Smith's text.

## Implementation Details

### One-Object Category
The most trivial subcategory: a single group \(G\) with only \(\mathrm{id}_G\).
- Objects: \(\{G\}\)
- Morphisms: \(\{\mathrm{id}_G\}\)
- Composition: \(\mathrm{id}_G \circ \mathrm{id}_G = \mathrm{id}_G\)

### Identities-Only Category  
Multiple groups with no "cross-talk":
- Objects: \(\{G_1, G_2, \ldots, G_n\}\)
- Morphisms: \(\{\mathrm{id}_{G_1}, \mathrm{id}_{G_2}, \ldots, \mathrm{id}_{G_n}\}\)
- No homomorphisms between distinct groups

### Finite Isomorphism Category
Groups of bounded order with only invertible morphisms:
- Objects: finite groups \(G\) with \(|G| \leq n\)
- Morphisms: only isomorphisms (bijective homomorphisms)
- Captures "structural equivalence" without non-invertible maps

### Finite Full Category
The richest finite subcategory:
- Objects: finite groups \(G\) with \(|G| \leq n\)  
- Morphisms: all homomorphisms (including non-surjective, non-injective)
- Includes quotient maps, embeddings, trivial homomorphisms

## Categorical Hierarchy

```
One-Object ⊆ Identities-Only ⊆ Finite-Iso ⊆ Finite-Full ⊆ Grp
```

This demonstrates how categorical structure can be **gradually enriched** from minimal to maximal homomorphism content.

*Code:* `src/category/instances/Subcategories.ts`  
*Tests:* `test/category/subcategories.test.ts`