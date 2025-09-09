# The Three Isomorphism Theorems

## Second Isomorphism Theorem (Diamond Isomorphism)
**Statement:** For subgroup A and normal subgroup N of G:
(A·N)/N ≅ A/(A∩N)

**Intuition:** The "diamond" lattice of subgroups A, N, A·N, A∩N gives an isomorphism between the quotients.

## Third Isomorphism Theorem (Tower Law)
**Statement:** For normal subgroups K ⊆ N ⊆ G:
G/N ≅ (G/K)/(N/K)

**Intuition:** "Quotient of quotients" - you can factor out subgroups in stages.

## Implementation Notes
- Uses the consolidated GroupHom system
- Builds on kernel/image construction from First Isomorphism Theorem
- Witness data captures the subgroup lattice structure
- Examples use cyclic groups Z/nZ for concrete verification

*Sources:* 
- Dummit & Foote, *Abstract Algebra*, Ch. 3
- Mac Lane, *Categories for the Working Mathematician*, Ch. VIII

These theorems complete the classical trilogy and provide the foundation for more advanced categorical constructions!
