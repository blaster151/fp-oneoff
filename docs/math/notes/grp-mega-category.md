# The category **Grp** (Smith §2.9)

- **Objects:** all (small) groups \(G\).
- **Morphisms:** group homomorphisms \(f:G\to H\).
- **Laws:** closed under composition; identity homs present; assoc + id laws hold.

**Operationalization**
- `src/category/instances/Grp.ts` implements Grp with total `id` and `compose`.
- Inclusion functors from restricted subcategories (finite-only, isos-only, identities-only).
- Forgetful functor \(U:\mathbf{Grp}\to\mathbf{Set}\) on carriers.

**Future unlocks**
- Products/kernels/cokernels inside **Grp**; First Isomorphism Theorem executable.
- Adjunctions: Free/Forgetful between **Set** and **Grp**.


