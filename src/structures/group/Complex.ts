export type C = { re: number; im: number };

export const C = {
  mk: (re:number, im:number): C => ({ re, im }),
  mul: (a:C,b:C): C => ({ re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re }),
  inv: (z:C): C => { const d = z.re*z.re + z.im*z.im; return { re: z.re/d, im: -z.im/d }; },
  eqApprox: (eps=1e-9) => (a:C,b:C) => Math.hypot(a.re-b.re, a.im-b.im) <= eps,
  one: { re: 1, im: 0 }
};

/** exp(i x) = cos x + i sin x */
export const exp_i = (x:number): C => ({ re: Math.cos(x), im: Math.sin(x) });