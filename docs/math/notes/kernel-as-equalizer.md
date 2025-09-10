# Kernels as Equalizers in \(\mathbf{Grp}\) (Smith §2.7–§2.8 → categorical)

**Statement.** For \(f:G\to H\), the kernel \(\ker f=\{x\in G \mid f(x)=e_H\}\) is a normal subgroup, and the inclusion
\(i:\ker f\hookrightarrow G\) satisfies the **equalizer** universal property for the pair \((f,\,e_H\!)\).

**Mathematical Construction:**
- **Kernel object**: `K = { elems: [g ∈ G | f(g) = e_H] }`
- **Inclusion morphism**: `ι: K → G` where `ι(k) = k` (natural embedding)
- **Universal property**: For any `g: J → G` with `f ∘ g = const_e`, there exists unique `u: J → K` with `ι ∘ u = g`

**Implementation Features:**
- Constructs kernel as a subgroup with inherited operations
- Verifies kernel elements map to identity under original homomorphism
- Implements equalizer universal property with uniqueness verification

**Category Theory Significance:**
This shows that kernels in **Grp** are equalizers, connecting group theory to categorical limit theory. The kernel construction gives us:
- Normal subgroups arise naturally as equalizers
- First Isomorphism Theorem follows from equalizer properties
- Connection to quotient groups via coequalizers

**Verification:**
- Kernel contains exactly elements mapping to identity
- Inclusion is a group homomorphism
- Universal property holds for any compatible morphism

*Code:* `src/algebra/group/Kernels.ts`  
*Tests:* `test/algebra/group/kernel_equalizer.test.ts`