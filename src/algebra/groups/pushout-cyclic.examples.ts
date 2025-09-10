import { Zmod, homZkToZm } from "./cyclic";
import { pushoutCyclic } from "./pushout-cyclic";

// Example 1: glue Z_4 and Z_6 along Z_2
// f: Z_2 -> Z_4, 1 |-> 2 (since 2*2 = 4 ≡ 0 mod 4)
// g: Z_2 -> Z_6, 1 |-> 3 (since 2*3 = 6 ≡ 0 mod 6)
// Pushout ≅ (Z_4 ⊕ Z_6)/<(2,-3)>. Here ord(2 in Z4)=2, ord(3 in Z6)=2 => ord_h=2, size= (4*6)/2=12.
const f1 = homZkToZm(2, 4, 2);
const g1 = homZkToZm(2, 6, 3);
const P1 = pushoutCyclic(f1, g1);
console.log("Example 1 size:", P1.size); // 12

// quick closure check:
const a = P1.norm([1,0]), b = P1.norm([0,1]);
const s = P1.add(a, b);
console.log("a+b =", P1.show!(s));

// Example 2: identity inclusions produce the direct sum
// f: Z_k -> Z_m with u=0; g: Z_k -> Z_n with v=0  (both maps are trivial)
// then <(0,0)> is trivial, pushout = Z_m ⊕ Z_n
const f2 = homZkToZm(3, 4, 0);
const g2 = homZkToZm(3, 5, 0);
const P2 = pushoutCyclic(f2, g2);
console.log("Example 2 size (should be 20):", P2.size);
