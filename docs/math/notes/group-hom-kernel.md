# Kernel of a Group Homomorphism

**Definition.** For \(f:G\to H\), the kernel is
\(\ker f = \{ g\in G : f(g)=e_H \}\).

**Theorem.** \(\ker f\) is always a subgroup of \(G\).  
Proof:  
- \(e_G \in \ker f\) since \(f(e_G)=e_H\).  
- If \(g\in\ker f\), then \(f(g^{-1})=(f(g))^{-1}=e_H\), so \(g^{-1}\in\ker f\).  
- If \(g,h\in\ker f\), then \(f(gh)=f(g)f(h)=e_H e_H = e_H\).  

**Operationalization.**
- `analyzeGroupHom` now computes `kernelSubgroup`.
- Examples:  
  - `ℤ/4ℤ → ℤ/2ℤ, x↦x mod 2` has kernel {0,2}.  
  - Trivial hom has kernel all of domain.  
  - Identity hom has kernel {e}.

*Source:* Smith, *Intro to Category Theory*, §2.7 (follows Theorem 6).