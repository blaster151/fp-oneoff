# Quotients, kernel pairs, and factorization (Smith §2.7, Thm 6–9)

**Thm 6 (Image subgroup).** For a homomorphism \(f:G\to H\), the set \(f[G]\) with the
restricted operation is a subgroup of \(H\).

**Thm 8 (Kernel).** The kernel \(K=\{x\in G \mid f(x)=e_H\}\) is a normal subgroup of \(G\).

**Thm 9 (Image ≅ Quotient).**
Define \(x \sim y \iff f(x)=f(y)\). This is a **congruence** on \(G\).
Hence the quotient group \(G/{\sim}\) exists and \(f\) factors as
\[
  G \xrightarrow{\pi} G/{\sim} \xrightarrow{\iota} H
\]
with \(\iota\!\circ\!\pi=f\) and \(G/{\sim} \cong \mathrm{im}(f)\).
Conversely, every quotient \(G/{\sim}\) arises as the image of the canonical
projection \(f_\sim(g)=[g]\).

**Operationalization.**
- `Congruence`, `quotientGroup`, and `GroupHom.factorization()`.
- Test: `iota ∘ pi = f`, `|G/≈| = |im(f)|`, homomorphism laws for `iota`.

**Additions.**
- `imageSubgroup(f)` realizes Thm 6 (im(f) is a subgroup).
- `kernelNormalSubgroup(f)` realizes Thm 8 (ker(f) is normal).
- Both now wired through `Eq` interface for structural equality, not `.show` hacks.

These make Thm 9's factorization canonical:  
\[
  f = \iota \circ \pi : G \to G/{\sim} \to H
\]
with \(\mathrm{im}(f)\) realized as a subgroup of \(H\) and \(\ker(f)\) as a normal subgroup of \(G\).

*Source:* Peter Smith, *Introduction to Category Theory*, §2.7.