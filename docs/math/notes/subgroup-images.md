# Subgroups as Images of Homomorphisms

- **Theorem 6.** For any hom \(f:G→H\), the image \(f[G]\) is a subgroup of \(H\).  
- **Theorem 7.** For any subgroup \(S≤H\), there exists a hom \(f:G→H\) with \(f[G]=S\) (take \(G=S\), inclusion).

**Operationalization.**  
- `analyzeGroupHom` shows images are subgroups.  
- `inclusionHom(H,S)` witnesses the reverse: builds \(S\hookrightarrow H\) with image \(S\).  

**Category-theoretic significance.** This bidirectional bridge between subgroups and homomorphism images foreshadows the general "epi–mono factorization" theorem: any map factors as a surjection followed by an injection. Subgroups as images are the group-specific case.

**Files:** `Hom.ts` (inclusionHom), tests in `theorem7-subgroup-images.test.ts`.