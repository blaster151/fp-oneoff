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

*Source:* Peter Smith, *Introduction to Category Theory*, §2.7.

---
**Proof sketch (Smith §2.7).**
- Kernel-pair relation ≈ from f is an equivalence.
- Compatibility with group operation ⇒ ≈ is a congruence.
- Hence G/≈ is a group; im(f) ≅ G/≈.
- Conversely, any quotient G/≈ arises as im(f_≈).
Thus every hom f factors: G → G/≈ → H.

👉 So the new raw material is basically the **operational law**:
 *Any hom f can (and should) be represented canonically as quotient ∘ inclusion.*

---

**Additions.**
- `imageSubgroup(f)` realizes Thm 6 (im(f) is a subgroup).
- `kernelNormalSubgroup(f)` realizes Thm 8 (ker(f) is normal).
- Both now wired through `Eq` interface for structural equality, not `.show` hacks.

These make Thm 9's factorization canonical:  
\[
  f = \iota \circ \pi : G \to G/{\sim} \to H
\]
with \(\mathrm{im}(f)\) realized as a subgroup of \(H\) and \(\ker(f)\) as a normal subgroup of \(G\).

## Implementation Details

The factorization method now accepts an optional `Eq<H>` parameter:
- `factorization(eqH?: Eq<H>)` uses custom equality for target group elements
- Falls back to `target.eq` when no custom equality provided
- Enables flexible congruence relations beyond string-based equality

Example usage:
```typescript
const eqZ4: Eq<number> = { eq: (a,b) => (a % 4) === (b % 4) };
const { quotient, pi, iota, law_compose_equals_f } = f.factorization(eqZ4);
```