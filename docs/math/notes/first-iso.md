# First Isomorphism Theorem (Executable Version)

Given a homomorphism \(f:G\to H\),
- \(\ker f\) is normal,
- \(\varphi:G/\ker f \to \mathrm{im}\,f\), \([g]\mapsto f(g)\) is well-defined,
- \(\varphi\) is a bijective homomorphism.

**Implementation notes**
- `kernel(f)`, `image(f)` compute the sets for finite groups.
- `quotientCosets(G, ker)` builds cosets of \(\ker f\).
- `phiToImage(f, ker, coset)` checks well-definedness (throws if not).
- `firstIsoWitness(f)` verifies homomorphism + bijection, reporting `{ inj, surj, homo, iso }`.

**Guardrail (CI-ish) rule:** fail builds if a new hom claims to be iso but the witness fails.