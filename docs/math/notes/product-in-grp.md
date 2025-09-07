# Product in \(\mathbf{Grp}\) (Smith §2.3, §2.9)

**Construction.** \(G\times H\) with componentwise operation; projections \(\pi_1,\pi_2\).  
**Universal property.** For any \(K \xrightarrow{f} G, K \xrightarrow{g} H\) there is a unique
\(\langle f,g\rangle : K \to G\times H\) with \(\pi_1\circ\langle f,g\rangle=f\), \(\pi_2\circ\langle f,g\rangle=g\).

*Code:* `src/algebra/group/GroupProduct.ts`  
*Tests:* `test/algebra/group/product_universal_property.test.ts`