# Quotients from Congruences; Images from Homomorphisms (Smith §2.7, Thm 9)

**Theorem.** For a homomorphism \(f:G→H\), the relation \(x≈y \iff f(x)=f(y)\) is a group **congruence**.
The image of \(f\) is (isomorphic to) the quotient \(G/≈\).
Conversely, every quotient \(G/≈\) arises as the image of some hom \(f\) from \(G\).

**Operationalization.**
- `congruenceFromHom(G,H,f)` builds the kernel-pair congruence.
- `QuotientGroup(cong)` constructs \(G/≈\) with coset reps.
- `firstIsomorphismData(F)` returns the canonical \(\Phi: G/≈_f → im(f)\) and law checks.

**Proof sketch (Smith §2.7).**
- Kernel-pair relation ≈ from f is an equivalence.
- Compatibility with group operation ⇒ ≈ is a congruence.
- Hence G/≈ is a group; im(f) ≅ G/≈.
- Conversely, any quotient G/≈ arises as im(f_≈).
Thus every hom f factors: G → G/≈ → H.

**Proof Machinery.**
- `isCongruence(G, eq)` validates that a relation is a congruence (equivalence + compatibility).
- `factorThroughQuotient(hom)` factors f = ι ∘ π where π: G → G/≈_f (surjection) and ι: G/≈_f → H (injection).
- This encodes the First Isomorphism Theorem constructively.

**Next unlock:** First Isomorphism Theorem as an explicit `GroupIso`.