# Quotients from Congruences; Images from Homomorphisms (Smith §2.7, Thm 9)

**Theorem.** For a homomorphism \(f:G→H\), the relation \(x≈y \iff f(x)=f(y)\) is a group **congruence**.
The image of \(f\) is (isomorphic to) the quotient \(G/≈\).
Conversely, every quotient \(G/≈\) arises as the image of some hom \(f\) from \(G\).

**Operationalization.**
- `congruenceFromHom(G,H,f)` builds the kernel-pair congruence.
- `QuotientGroup(cong)` constructs \(G/≈\) with coset reps.
- `firstIsomorphismData(F)` returns the canonical \(\Phi: G/≈_f → im(f)\) and law checks.

**Next unlock:** First Isomorphism Theorem as an explicit `GroupIso`.