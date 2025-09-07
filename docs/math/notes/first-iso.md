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

**Plural idiom connection:** We never reify "the set of all groups" - we just work with concrete finite carriers and their operations, letting the mathematical structure emerge through computation rather than set-theoretic foundations.

*Code:* `src/algebra/groups/firstIso.ts`  
*Tests:* `tests/groups/firstIso.test.ts`  
*Guards:* `scripts/guards/iso-guard.ts`