# First Isomorphism Theorem (Groups) — Executable Note

**Statement.** For a group homomorphism \(f:G\to H\), the kernel \(\ker f\) is a normal subgroup of \(G\),
the image \(\operatorname{im} f\) is a subgroup of \(H\), and there is a canonical isomorphism
\[
\phi: G/\ker f \stackrel{\cong}{\longrightarrow} \operatorname{im} f,\qquad \phi([g]) = f(g).
\]

**In code.**
- `kernel(f)`, `image(f)` return membership predicate and induced subgroup (finite enumeration when present).
- `quotientGroup(G, ker(f))` constructs cosets (finite).
- `firstIsomorphism(f)` builds the isomorphism with left/right inverse witnesses and tests them by exhaustive check.

**Tests/examples.** `C4 --mod2--> C2`: verifies \(C_4/\ker \cong C_2\).

**Source.** Smith, *Introduction to Category Theory*, §2.7–§2.9 (kernels, images, quotient groups, and homomorphisms).