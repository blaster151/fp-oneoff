# Kernels as Equalizers in \(\mathbf{Grp}\) (Smith §2.7–§2.8 → categorical)

**Statement.** For \(f:G\to H\), the kernel \(\ker f=\{x\in G \mid f(x)=e_H\}\) is a normal subgroup, and the inclusion
\(i:\ker f\hookrightarrow G\) satisfies the **equalizer** universal property for the pair \((f,\,e_H\!)\).

*Code:* `src/algebra/group/Kernels.ts`  
*Tests:* `test/algebra/group/kernel_equalizer.test.ts`